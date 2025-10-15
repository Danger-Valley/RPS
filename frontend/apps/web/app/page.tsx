"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';

export default function HomePage() {
  const { connected } = useWallet();

  return (
    <main style={{
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }}>
      <h1 style={{ margin: 0 }}>RPS Arena</h1>
      <div style={{ display: 'flex', gap: 12 }}>
        <WalletMultiButton />
        <button
          style={{ padding: 8 }}
          disabled={!connected}
          onClick={() => toast.success('Starting game…')}
        >
          Start game
        </button>
        <button
          style={{ padding: 8 }}
          disabled={!connected}
          onClick={() => toast.message('Starting private game…')}
        >
          Start private game
        </button>
      </div>
    </main>
  );
}

