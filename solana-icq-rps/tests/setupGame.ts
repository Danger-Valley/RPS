import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { SolanaIcqRps } from '../target/types/solana_icq_rps';
import { airdropIfNeeded, gamePda, registryPda } from './pdas';
import { decodeGame, printBoard, toIdx } from './cells';

export interface GameSetupReturn {
  program: anchor.Program<any>;
  p0: anchor.web3.PublicKey;
  p1: anchor.web3.Keypair;
  game: anchor.web3.PublicKey;
  reg: anchor.web3.PublicKey;
}

export const setupGame = async (): Promise<GameSetupReturn> => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.solanaIcqRps as Program<SolanaIcqRps>;
  const conn = provider.connection;

  const p0 = (provider.wallet as anchor.Wallet).publicKey;
  const p1 = Keypair.generate();
  await airdropIfNeeded(conn, p0);
  await airdropIfNeeded(conn, p1.publicKey);

  const reg = registryPda(program.programId);
  let nextId = 0;
  try {
    const r: any = await program.account.registry.fetch(reg);
    nextId = Number(r.nextGameId);
  } catch {}

  const game = gamePda(program.programId, reg, nextId);

  // create + join
  await program.methods
    .createGame()
    .accountsStrict({
      registry: reg,
      game,
      payer: p0,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  await program.methods
    .joinGame()
    .accountsStrict({ game, registry: reg, joiner: p1.publicKey })
    .signers([p1])
    .rpc();

  // flags
  await program.methods
    .placeFlag(toIdx(3, 5))
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();
  await program.methods
    .placeFlag(toIdx(3, 0))
    .accountsStrict({ game, registry: reg, signer: p1.publicKey })
    .signers([p1])
    .rpc();

  const g = await program.account.game.fetch(game);
  const dec = decodeGame(g);
  printBoard(dec.owners, dec.pieces);

  return { program, p0, p1, game, reg };
};
