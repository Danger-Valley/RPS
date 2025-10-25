import { setupGame, GameSetupReturn } from './setupGame';
import {
  padPieces,
  spawnCells,
  toXY,
  u8,
  decodeGame,
  printBoard,
} from './cells';

export const submitFixedLineup = async (): Promise<GameSetupReturn> => {
  const { program, p0, p1, game, reg } = await setupGame();
  console.log('setup done');

  // lineup p0
  let g: any = await program.account.game.fetch(game);
  const flag0 = Number(g.flagPos0);
  const flag1 = Number(g.flagPos1);

  const cells0 = spawnCells(true).filter((i) => i !== flag0);
  const xs0 = cells0.map((i) => toXY(i).x);
  const ys0 = cells0.map((i) => toXY(i).y);
  const pcs0 = padPieces([], cells0.length);

  await program.methods
    .submitLineupXy(u8(xs0), u8(ys0), u8(pcs0))
    .accountsStrict({ inner: { game, registry: reg, signer: p0 } })
    .rpc();

  // lineup p1
  const cells1 = spawnCells(false).filter((i) => i !== flag1);
  const xs1 = cells1.map((i) => toXY(i).x);
  const ys1 = cells1.map((i) => toXY(i).y);
  const pcs1 = padPieces([], cells1.length);
  await program.methods
    .submitLineupXy(u8(xs1), u8(ys1), u8(pcs1))
    .accountsStrict({ inner: { game, registry: reg, signer: p1.publicKey } })
    .signers([p1])
    .rpc();

  g = await program.account.game.fetch(game);
  let gDec = decodeGame(g);
  printBoard(gDec.owners, gDec.pieces);

  return { program, p0, p1, game, reg };
};
