import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const airdropIfNeeded = async (
  conn: Connection,
  pk: PublicKey,
  minSol = 2,
) => {
  const bal = await conn.getBalance(pk);
  if (bal < minSol * LAMPORTS_PER_SOL) {
    const sig = await conn.requestAirdrop(pk, minSol * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig, 'confirmed');
  }
};

export const registryPda = (programId: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    programId,
  );
  return pda;
};

export const gamePda = (
  programId: PublicKey,
  registry: PublicKey,
  id: number,
) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(id, 0);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), registry.toBuffer(), b],
    programId,
  );
  return pda;
};
