"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';

export default function HomePage() {
  const { connected } = useWallet();

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>RPS Onchain</h1>
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

