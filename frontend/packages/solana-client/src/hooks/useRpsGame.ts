import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { RpsGameClient, Phase, Choice, Piece, Owner } from '../index';
import idl from '../idl/idl.json';

export interface GameState {
  gameId: number;
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
  createGame: () => Promise<{ gameId: number; gamePda: string }>;
  joinGame: (gameId: number) => Promise<void>;
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

export function useRpsGame(gameId?: number): UseRpsGameReturn {
  const { wallet, publicKey, connected } = useWallet();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameClient, setGameClient] = useState<RpsGameClient | null>(null);

  // Initialize game client when wallet connects
  useEffect(() => {
    if (connected && wallet && publicKey) {
      try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const provider = new AnchorProvider(
          connection,
          wallet.adapter as any,
          { commitment: 'confirmed' }
        );
        
        // Use the imported IDL
        
        const client = new RpsGameClient(provider, idl as any);
        setGameClient(client);
        setError(null);
      } catch (err) {
        setError(`Failed to initialize game client: ${err}`);
      }
    } else {
      setGameClient(null);
      setGameState(null);
    }
  }, [connected, wallet, publicKey]);

  // Load game state when gameId changes
  useEffect(() => {
    if (gameClient && gameId !== undefined && gameId > 0) {
      loadGameState();
    }
  }, [gameClient, gameId]);

  const loadGameState = useCallback(async () => {
    if (!gameClient || gameId === undefined || gameId <= 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate proper PDAs using the game client
      const registry = gameClient.registryPda();
      const gamePda = gameClient.gamePda(registry, gameId);
      
      const state = await gameClient.getGameState(gamePda);
      
      // Print game board for debugging
      console.log('=== LOADING GAME STATE ===');
      console.log('Game ID:', gameId);
      console.log('Game PDA:', gamePda.toString());
      console.log('Registry PDA:', registry.toString());
      
      setGameState({
        gameId,
        gamePda,
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
  }, [gameClient, gameId]);

  const createGame = useCallback(async (): Promise<{ gameId: number; gamePda: string }> => {
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
      const { gameId, gamePda } = await gameClient.createGame();
      
      // Fetch the actual game state from the smart contract
      await loadGameState();
      
      return { gameId, gamePda: gamePda.toString() };
    } catch (err) {
      console.error('Create game error:', err);
      setError(`Failed to create game: ${err}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gameClient, publicKey, loading]);

  const joinGame = useCallback(async (targetGameId: number) => {
    if (!gameClient) {
      setError('Game client not initialized');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Calculate proper PDAs using the game client
      const registry = gameClient.registryPda();
      const gamePda = gameClient.gamePda(registry, targetGameId);
      
      await gameClient.joinGame(gamePda);
      await loadGameState();
    } catch (err) {
      setError(`Failed to join game: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, loadGameState]);

  const placeFlag = useCallback(async (x: number, y: number) => {
    if (!gameClient || !gameState) {
      setError('Game client not initialized or no game state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.placeFlag(gameState.gamePda, x, y);
      await loadGameState();
    } catch (err) {
      setError(`Failed to place flag: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const submitLineup = useCallback(async (isP0: boolean, flagPos: number) => {
    if (!gameClient || !gameState) {
      setError('Game client not initialized or no game state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.submitLineup(gameState.gamePda, isP0, flagPos);
      await loadGameState();
    } catch (err) {
      setError(`Failed to submit lineup: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const submitCustomLineup = useCallback(async (xs: number[], ys: number[], pieces: number[]) => {
    if (!gameClient || !gameState) {
      setError('Game client not initialized or no game state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.submitCustomLineup(gameState.gamePda, xs, ys, pieces);
      await loadGameState();
    } catch (err) {
      setError(`Failed to submit custom lineup: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const movePiece = useCallback(async (fromX: number, fromY: number, toX: number, toY: number) => {
    if (!gameClient || !gameState) {
      setError('Game client not initialized or no game state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.movePiece(gameState.gamePda, fromX, fromY, toX, toY);
      await loadGameState();
    } catch (err) {
      setError(`Failed to move piece: ${err}`);
    } finally {
      setLoading(false);
    }
  }, [gameClient, gameState, loadGameState]);

  const chooseWeapon = useCallback(async (choice: Choice) => {
    if (!gameClient || !gameState) {
      setError('Game client not initialized or no game state');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await gameClient.chooseWeapon(gameState.gamePda, choice);
      await loadGameState();
    } catch (err) {
      setError(`Failed to choose weapon: ${err}`);
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
  const isPlayer0 = gameState?.p0 === publicKey?.toString();
  const isPlayer1 = gameState?.p1 === publicKey?.toString();
  const isMyTurn = gameState ? isPlayerTurn(isPlayer1) : false;

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
