import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { RpsGameClient, Phase, Choice, Piece, Owner, isEmptyAddress } from '../index';
import idl from '../idl/solana_icq_rps.json';

export interface GameState {
  gamePda: PublicKey;
  phase: Phase;
  isP1Turn: boolean;
  owners: Owner[];
  pieces: Piece[];
  live0: number;
  live1: number;
  flagPos0: number;
  flagPos1: number;
  tiePending: boolean;
  tieFrom: { x: number; y: number };
  tieTo: { x: number; y: number };
  choiceMade0: boolean;
  choiceMade1: boolean;
  choice0: Choice;
  choice1: Choice;
  p0: string;
  p1: string;
  winner: string | null;
}

export interface UseRpsGameReturn {
  // Game state
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  
  // Game actions
  createGame: () => Promise<{ gamePda: string }>;
  joinGame: (gamePda: string) => Promise<void>;
  placeFlag: (x: number, y: number) => Promise<void>;
  submitLineup: (isP0: boolean, flagPos: number) => Promise<void>;
  submitCustomLineup: (xs: number[], ys: number[], pieces: number[]) => Promise<void>;
  movePiece: (fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
  chooseWeapon: (choice: Choice) => Promise<void>;
  
  // Game utilities
  refreshGameState: () => Promise<void>;
  isPlayerTurn: (isPlayer1: boolean) => boolean;
  getAvailableMoves: (fromX: number, fromY: number) => { x: number; y: number }[];
  isValidMove: (fromX: number, fromY: number, toX: number, toY: number) => boolean;
  
  // Game info
  isPlayer0: boolean;
  isPlayer1: boolean;
  isMyTurn: boolean;
}

export function useRpsGame(gamePda?: string): UseRpsGameReturn {
  const { wallet, publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameClient, setGameClient] = useState<RpsGameClient | null>(null);

  // Initialize game client when wallet connects
  useEffect(() => {
    if (connected && wallet && publicKey) {
      try {
        console.log('Initializing game client...');
        console.log('Wallet connected:', connected);
        console.log('Wallet adapter:', wallet.adapter);
        console.log('Wallet adapter methods:', {
          signTransaction: typeof (wallet.adapter as any).signTransaction,
          signAllTransactions: typeof (wallet.adapter as any).signAllTransactions,
          connected: wallet.adapter.connected,
          publicKey: wallet.adapter.publicKey?.toString()
        });
        console.log('useWallet methods:', {
          signTransaction: typeof signTransaction,
          signAllTransactions: typeof signAllTransactions,
          connected: connected,
          publicKey: publicKey?.toString()
        });
        console.log('Public key:', publicKey.toString());
        
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Create a minimal wallet object using useWallet methods
        const walletObj = {
          publicKey: publicKey,
          signTransaction: async (tx: any) => {
            console.log('Signing transaction with useWallet...');
            try {
              if (!signTransaction) {
                throw new Error('signTransaction not available');
              }
              const signedTx = await signTransaction(tx);
              console.log('Transaction signed successfully');
              return signedTx;
            } catch (error) {
              console.error('Error signing transaction:', error);
              throw error;
            }
          },
          signAllTransactions: async (txs: any[]) => {
            console.log('Signing multiple transactions with useWallet...');
            try {
              if (!signAllTransactions) {
                throw new Error('signAllTransactions not available');
              }
              const signedTxs = await signAllTransactions(txs);
              console.log('All transactions signed successfully');
              return signedTxs;
            } catch (error) {
              console.error('Error signing transactions:', error);
              throw error;
            }
          },
        };
        
        const provider = new AnchorProvider(
          connection,
          walletObj as any,
          { 
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
          }
        );
        
        console.log('Provider created:', provider);
        
        // Use the imported IDL
        const client = new RpsGameClient(provider, idl as any);
        setGameClient(client);
        setError(null);
        console.log('Game client initialized successfully');
      } catch (err) {
        console.error('Failed to initialize game client:', err);
        setError(`Failed to initialize game client: ${err}`);
      }
    } else {
      console.log('Wallet not ready:', { connected, wallet: !!wallet, publicKey: !!publicKey });
      setGameClient(null);
      setGameState(null);
    }
  }, [connected, wallet, publicKey]);

  // Load game state when gamePda changes
  useEffect(() => {
    if (gameClient && gamePda) {
      loadGameState();
    }
  }, [gameClient, gamePda]);

  const loadGameState = useCallback(async () => {
    if (!gameClient || !gamePda) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const gamePdaKey = new PublicKey(gamePda);
      const state = await gameClient.getGameState(gamePdaKey);
      
      // Print game board for debugging
      console.log('=== LOADING GAME STATE ===');
      console.log('Game PDA:', gamePda);
      
      setGameState({
        gamePda: gamePdaKey,
        ...state,
        phase: state.phase as Phase
      });
      
      // Print the game board after setting state
      console.log('=== GAME STATE LOADED ===');
      console.log('Owners:', state.owners);
      console.log('Pieces:', state.pieces);
      console.log('Phase:', state.phase);
      console.log('P0:', state.p0);
      console.log('P1:', state.p1);
    } catch (err) {
      setError(`Failed to load game state: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, gamePda]);

  const createGame = useCallback(async (): Promise<{ gamePda: string }> => {
    if (!gameClient) {
      setError('Game client not initialized');
      throw new Error('Game client not initialized');
    }
    
    if (loading) {
      throw new Error('Game creation already in progress');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { gamePda } = await gameClient.createGame();
      
      // Fetch the actual game state from the smart contract
      await loadGameState();
      
      return { gamePda: gamePda.toString() };
    } catch (err) {
      console.error('Create game error:', err);
      setError(`Failed to create game: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gameClient, publicKey, loading]);

  const joinGame = useCallback(async (gamePda: string) => {
    if (!gameClient) {
      setError('Game client not initialized');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const gamePdaKey = new PublicKey(gamePda);
      await gameClient.joinGame(gamePdaKey);
      await loadGameState();
    } catch (err) {
      console.error('Join game error:', err);
      
      // Handle specific error cases
      let errorMsg = '';
      if (err instanceof Error) {
        if (err.message.includes('already been processed')) {
          errorMsg = 'You have already joined this game';
        } else if (err.message.includes('already full')) {
          errorMsg = 'This game is already full';
        } else if (err.message.includes('already in this game')) {
          errorMsg = 'You are already in this game';
        } else {
          errorMsg = `Failed to join game: ${err.message}`;
        }
      } else {
        errorMsg = `Failed to join game: ${err}`;
      }
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, loadGameState]);

  const placeFlag = useCallback(async (x: number, y: number) => {
    if (!gameClient || !gameState) {
      const error = 'Game client not initialized or no game state';
      setError(error);
      throw new Error(error);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.placeFlag(gameState.gamePda, x, y);
      await loadGameState();
    } catch (err) {
      const errorMsg = `Failed to place flag: ${err}`;
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const submitLineup = useCallback(async (isP0: boolean, flagPos: number) => {
    if (!gameClient || !gameState) {
      const error = 'Game client not initialized or no game state';
      setError(error);
      throw new Error(error);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.submitLineup(gameState.gamePda, isP0, flagPos);
      await loadGameState();
    } catch (err) {
      const errorMsg = `Failed to submit lineup: ${err}`;
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const submitCustomLineup = useCallback(async (xs: number[], ys: number[], pieces: number[]) => {
    if (!gameClient || !gameState) {
      const error = 'Game client not initialized or no game state';
      setError(error);
      throw new Error(error);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.submitCustomLineup(gameState.gamePda, xs, ys, pieces);
      await loadGameState();
    } catch (err) {
      const errorMsg = `Failed to submit custom lineup: ${err}`;
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const movePiece = useCallback(async (fromX: number, fromY: number, toX: number, toY: number) => {
    if (!gameClient || !gameState) {
      const error = 'Game client not initialized or no game state';
      setError(error);
      throw new Error(error);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.movePiece(gameState.gamePda, fromX, fromY, toX, toY);
      await loadGameState();
    } catch (err) {
      const errorMsg = `Failed to move piece: ${err}`;
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const chooseWeapon = useCallback(async (choice: Choice) => {
    if (!gameClient || !gameState) {
      const error = 'Game client not initialized or no game state';
      setError(error);
      throw new Error(error);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.chooseWeapon(gameState.gamePda, choice);
      await loadGameState();
    } catch (err) {
      const errorMsg = `Failed to choose weapon: ${err}`;
      setError(errorMsg);
      throw err; // Re-throw the error so the caller can handle it
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const refreshGameState = useCallback(async () => {
    await loadGameState();
  }, [loadGameState]);

  const isPlayerTurn = useCallback((isPlayer1: boolean) => {
    return gameState?.isP1Turn === isPlayer1;
  }, [gameState]);

  const getAvailableMoves = useCallback((fromX: number, fromY: number) => {
    if (!gameState) return [];
    return gameClient?.getAvailableMoves(fromX, fromY, gameState.owners, gameState.pieces) || [];
  }, [gameClient, gameState]);

  const isValidMove = useCallback((fromX: number, fromY: number, toX: number, toY: number) => {
    if (!gameState) return false;
    return gameClient?.isValidMove(fromX, fromY, toX, toY, gameState.owners, gameState.pieces) || false;
  }, [gameClient, gameState]);

  // Computed values
  const isPlayer0 = gameState?.p0?.toString() === publicKey?.toString() && !isEmptyAddress(gameState?.p0?.toString());
  const isPlayer1 = gameState?.p1?.toString() === publicKey?.toString() && !isEmptyAddress(gameState?.p1?.toString());
  const isMyTurn = gameState ? isPlayerTurn(isPlayer1) : false;

  // Debug logging
  if (gameState && publicKey) {
    console.log('Hook player detection:', {
      userAddress: publicKey.toString(),
      p0: gameState.p0?.toString(),
      p1: gameState.p1?.toString(),
      isEmptyP0: isEmptyAddress(gameState.p0?.toString()),
      isEmptyP1: isEmptyAddress(gameState.p1?.toString()),
      isPlayer0,
      isPlayer1,
      phase: gameState.phase
    });
  }

  return {
    gameState,
    loading,
    error,
    createGame,
    joinGame,
    placeFlag,
    submitLineup,
    submitCustomLineup,
    movePiece,
    chooseWeapon,
    refreshGameState,
    isPlayerTurn,
    getAvailableMoves,
    isValidMove,
    isPlayer0,
    isPlayer1,
    isMyTurn,
  };
}
