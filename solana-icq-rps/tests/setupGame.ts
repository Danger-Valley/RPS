import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { SolanaIcqRps } from '../target/types/solana_icq_rps';
import { airdropIfNeeded, gamePda, registryPda } from './pdas';
import {
  buildFullLineupWithFlag,
  decodeGame,
  printBoard,
  toIdx,
  u8,
} from './cells';

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

  // create
  await program.methods
    .createGame()
    .accountsStrict({
      registry: reg,
      game,
      payer: p0,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  // lineup p0
  const p0FlagIdx = toIdx(3, 5);
  const {
    xs: xs0,
    ys: ys0,
    pcs: pcs0,
  } = buildFullLineupWithFlag(/* isP0 */ true, p0FlagIdx);

  await program.methods
    .submitLineupXy(u8(xs0), u8(ys0), u8(pcs0))
    .accountsStrict({ inner: { game, registry: reg, signer: p0 } })
    .rpc();

  // join
  await program.methods
    .joinGame()
    .accountsStrict({ game, registry: reg, joiner: p1.publicKey })
    .signers([p1])
    .rpc();

  const g = await program.account.game.fetch(game);
  const dec = decodeGame(g);
  printBoard(dec.owners, dec.pieces);

  return { program, p0, p1, game, reg };
};
