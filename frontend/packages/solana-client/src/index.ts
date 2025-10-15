export type Commitment = 'processed' | 'confirmed' | 'finalized';

export interface ClusterConfig {
  rpcUrl: string;
  commitment?: Commitment;
}

export function getDefaultCluster(): ClusterConfig {
  return { rpcUrl: 'https://api.devnet.solana.com', commitment: 'confirmed' };
}

// Placeholder for future Solana helpers (connection, tx builder, etc.)

