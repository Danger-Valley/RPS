import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { SolanaIcqRps } from "../target/types/solana_icq_rps";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

async function getProgram(): Promise<{provider: AnchorProvider, program: Program<SolanaIcqRps>}> {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solanaIcqRps as Program<SolanaIcqRps>;
  return {
    provider,
    program
  };
}


async function airdropIfNeeded(conn: Connection, pk: PublicKey, minSol = 2) {
  const bal = await conn.getBalance(pk);
  if (bal < minSol * LAMPORTS_PER_SOL) {
    const sig = await conn.requestAirdrop(pk, minSol * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig, "confirmed");
  }
}

function registryPda(programId: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], programId);
  return pda;
}

function gamePda(programId: PublicKey, registry: PublicKey, id: number) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(id, 0);
  const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("game"), registry.toBuffer(), b],
      programId
  );
  return pda;
}

describe("solana-icq-rps", () => {
  it("createGame → joinGame", async () => {
    const {program, provider} = await getProgram();
    const conn = provider.connection;

    const p0 = (provider.wallet as anchor.Wallet).publicKey;
    const p1 = Keypair.generate();
    console.log('p0: ', p0.toString(), ' p1: ', p1.publicKey.toString());

    await airdropIfNeeded(conn, p0, 2);
    await airdropIfNeeded(conn, p1.publicKey, 2);

    const regPda = registryPda(program.programId);
    console.log('regPda: ', regPda.toString());
    let nextId = 0;
    try {
      const reg: any = await program.account.registry.fetch(regPda);
      nextId = Number(reg.nextGameId);
    } catch (_) {
    }

    const gPda = gamePda(program.programId, regPda, nextId);
    console.log('gPda: ', gPda.toString());

    const sig1 = await program.methods
        .createGame()
        .accountsStrict({
          registry: regPda,
          game: gPda,
          payer: p0,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    console.log("create_game tx:", sig1);
    console.log("Game created, id =", nextId, "PDA =", gPda.toBase58());

    const sig2 = await program.methods
        .joinGame()
        .accountsStrict({
          game: gPda,
          registry: regPda,
          joiner: p1.publicKey,
        })
        .signers([p1])
        .rpc();
    console.log("join_game tx:", sig2);
    console.log("Game joined by P1:", p1.publicKey.toBase58());

    const g: any = await program.account.game.fetch(gPda);
    console.log('g: ', g)
    if (!g.player0.equals(p0)) throw new Error("player0 mismatch");
    if (!g.player1.equals(p1.publicKey)) throw new Error("player1 mismatch");
  });
});
