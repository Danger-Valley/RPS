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
  printGameBoard,
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

  // Get game PDA (now uses payer's public key as seed)
  public gamePda(payer: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('game'), payer.toBuffer()],//TODO: will gameId be the same every time for this user???
      this.program.programId,
    );
    return pda;
  }

  // Create a new game
  async createGame(): Promise<{ gamePda: PublicKey }> {
    // Check if already creating a game
    if (this.isCreatingGame) {
      throw new Error('Game creation already in progress');
    }
    
    this.isCreatingGame = true;
    
    try {
      console.log('Creating game...');
      console.log('Provider wallet:', this.provider.wallet.publicKey?.toString());
      console.log('Program ID:', this.program.programId.toString());
      console.log('RPC URL:', this.connection.rpcEndpoint);
      
      // Check wallet balance
      const balance = await this.connection.getBalance(this.provider.wallet.publicKey!);
      console.log('Wallet balance:', balance / 1e9, 'SOL');
      
      if (balance < 0.01 * 1e9) {
        throw new Error('Insufficient SOL balance. Need at least 0.01 SOL for transaction fees.');
      }
      
      const gamePda = this.gamePda(this.provider.wallet.publicKey!);
      console.log('Game PDA:', gamePda.toString());

      // Call the create_game instruction on the smart contract
      console.log('Sending createGame transaction...');
      const signature = await this.program.methods
        .createGame()
        .accountsStrict({
          game: gamePda,
          payer: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({
          skipPreflight: true, // Enable preflight checks
          preflightCommitment: 'confirmed',
          commitment: 'confirmed',
          maxRetries: 0 // Allow retries
        });

      console.log('Transaction signature:', signature);
      console.log('Game created successfully!');

      return { gamePda };
    } catch (error) {
      console.error('Game creation failed:', error);
      throw error;
    } finally {
      // Reset the flag
      this.isCreatingGame = false;
    }
  }

  // Join an existing game
  async joinGame(gamePda: PublicKey): Promise<void> {
    await this.program.methods
      .joinGame()
      .accountsStrict({
        game: gamePda,
        joiner: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  // Place flag at specific coordinates
  async placeFlag(gamePda: PublicKey, x: number, y: number): Promise<void> {
    await this.program.methods
      .placeFlagXy(x, y)
      .accountsStrict({
        inner: {
          game: gamePda,
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
          signer: this.provider.wallet.publicKey,
        },
      })
      .rpc();
  }

  // Submit custom lineup with specific positions and pieces
  async submitCustomLineup(
    gamePda: PublicKey,
    xs: number[],
    ys: number[],
    pieces: number[]
  ): Promise<void> {
    await this.program.methods
      .submitLineupXy(u8(xs), u8(ys), u8(pieces))
      .accountsStrict({
        inner: {
          game: gamePda,
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
    await this.program.methods
      .movePieceXy(fromX, fromY, toX, toY)
      .accountsStrict({
        game: gamePda,
        signer: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  // Choose weapon for tie-breaking
  async chooseWeapon(gamePda: PublicKey, choice: Choice): Promise<void> {
    await this.program.methods
      .chooseWeapon(choice)
      .accountsStrict({
        game: gamePda,
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
    printGameBoard(gameState);
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

