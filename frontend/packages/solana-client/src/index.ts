import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { SolanaIcqRps } from './types';
import {
  WIDTH,
  HEIGHT,
  CELLS,
  Piece,
  Owner,
  Phase,
  Choice,
  toIdx,
  toXY,
  spawnCells,
  padPieces,
  u8,
  decodeGame,
  printBoard,
} from './types';

export type Commitment = 'processed' | 'confirmed' | 'finalized';

export interface ClusterConfig {
  rpcUrl: string;
  commitment?: Commitment;
}

export function getDefaultCluster(): ClusterConfig {
  return { rpcUrl: 'https://api.devnet.solana.com', commitment: 'confirmed' };
}

// Game client class
export class RpsGameClient {
  private program: Program<SolanaIcqRps>;
  private provider: AnchorProvider;
  private connection: Connection;
  private isCreatingGame: boolean = false;

  constructor(provider: AnchorProvider, idl: SolanaIcqRps) {
    this.provider = provider;
    this.connection = provider.connection;
    
    // Initialize the program with the provided IDL
    this.program = new Program<SolanaIcqRps>(
      idl,
      provider
    );
  }

  // Get registry PDA
  public registryPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.program.programId,
    );
    return pda;
  }

  // Get game PDA
  public gamePda(registry: PublicKey, id: number): PublicKey {
    const b = Buffer.alloc(4);
    b.writeUInt32LE(id, 0);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('game'), registry.toBuffer(), b],
      this.program.programId,
    );
    return pda;
  }

  // Create a new game
  async createGame(): Promise<{ gameId: number; gamePda: PublicKey }> {
    // Check if already creating a game
    if (this.isCreatingGame) {
      throw new Error('Game creation already in progress');
    }
    
    this.isCreatingGame = true;
    
    try {
      const registry = this.registryPda();
      
      // Get next game ID from registry
      let nextId = 0;
      try {
        const reg = await this.program.account.registry.fetch(registry);
        nextId = Number(reg.nextGameId);
      } catch (error) {
        console.log('Registry not found, starting with game ID 0');
      }

      const gamePda = this.gamePda(registry, nextId);

      // Add a small delay to ensure unique transaction timing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Call the create_game instruction on the smart contract
      await this.program.methods
        .createGame()
        .accountsStrict({
          registry,
          game: gamePda,
          payer: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          commitment: 'confirmed',
          maxRetries: 0 // Prevent automatic retries
        });

      return { gameId: nextId, gamePda };
    } finally {
      // Reset the flag
      this.isCreatingGame = false;
    }
  }

  // Join an existing game
  async joinGame(gamePda: PublicKey): Promise<void> {
    const registry = this.registryPda();

    await this.program.methods
      .joinGame()
      .accountsStrict({
        game: gamePda,
        registry,
        joiner: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  // Place flag at specific coordinates
  async placeFlag(gamePda: PublicKey, x: number, y: number): Promise<void> {
    const registry = this.registryPda();

    await this.program.methods
      .placeFlagXy(x, y)
      .accountsStrict({
        inner: {
          game: gamePda,
          registry,
          signer: this.provider.wallet.publicKey,
        },
      })
      .rpc();
  }

  // Submit lineup with XY coordinates
  async submitLineup(
    gamePda: PublicKey,
    isP0: boolean,
    flagPos: number
  ): Promise<void> {
    const registry = this.registryPda();
    
    // Get spawn cells for the player
    const cells = spawnCells(isP0).filter(i => i !== flagPos);
    const xs = cells.map(i => toXY(i).x);
    const ys = cells.map(i => toXY(i).y);
    const pieces = padPieces([], cells.length);

    await this.program.methods
      .submitLineupXy(u8(xs), u8(ys), u8(pieces))
      .accountsStrict({
        inner: {
          game: gamePda,
          registry,
          signer: this.provider.wallet.publicKey,
        },
      })
      .rpc();
  }

  // Move a piece
  async movePiece(
    gamePda: PublicKey,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): Promise<void> {
    const registry = this.registryPda();

    await this.program.methods
      .movePieceXy(fromX, fromY, toX, toY)
      .accountsStrict({
        game: gamePda,
        registry,
        signer: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  // Choose weapon for tie-breaking
  async chooseWeapon(gamePda: PublicKey, choice: Choice): Promise<void> {
    const registry = this.registryPda();

    await this.program.methods
      .chooseWeapon(choice)
      .accountsStrict({
        game: gamePda,
        registry,
        signer: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  // Fetch game state
  async getGameState(gamePda: PublicKey) {
    const game = await this.program.account.game.fetch(gamePda);
    return decodeGame(game);
  }

  // Print current board state
  async printGameBoard(gamePda: PublicKey) {
    const gameState = await this.getGameState(gamePda);
    printBoard(gameState.owners, gameState.pieces);
    return gameState;
  }

  // Check if it's the player's turn
  async isPlayerTurn(gamePda: PublicKey, isPlayer1: boolean): Promise<boolean> {
    const gameState = await this.getGameState(gamePda);
    return gameState.isP1Turn === isPlayer1;
  }

  // Get available moves for a piece
  getAvailableMoves(
    fromX: number,
    fromY: number,
    owners: Owner[],
    pieces: Piece[]
  ): { x: number; y: number }[] {
    const moves: { x: number; y: number }[] = [];
    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    directions.forEach(({ x: deltaX, y: deltaY }) => {
      const newX = fromX + deltaX;
      const newY = fromY + deltaY;
      
      // Check bounds
      if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
        const targetIdx = toIdx(newX, newY);
        const targetOwner = owners[targetIdx];
        
        // Can move to empty cells or attack opponent pieces
        if (targetOwner === Owner.None || targetOwner !== owners[toIdx(fromX, fromY)]) {
          moves.push({ x: newX, y: newY });
        }
      }
    });

    return moves;
  }

  // Check if a move is valid
  isValidMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    owners: Owner[],
    pieces: Piece[]
  ): boolean {
    const availableMoves = this.getAvailableMoves(fromX, fromY, owners, pieces);
    return availableMoves.some(move => move.x === toX && move.y === toY);
  }
}

// Export all types and utilities
export * from './types';
export * from './hooks/useRpsGame';

