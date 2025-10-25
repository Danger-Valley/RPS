import { setupGame, GameSetupReturn } from './setupGame';
import {
  u8,
  decodeGame,
  printBoard,
  toIdx,
  buildFullLineupWithFlag,
} from './cells';

export const submitFixedLineup = async (): Promise<GameSetupReturn> => {
  const { program, p0, p1, game, reg } = await setupGame();
  console.log('setup done');

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

  // lineup p1
  const p1FlagIdx = toIdx(3, 0);
  const {
    xs: xs1,
    ys: ys1,
    pcs: pcs1,
  } = buildFullLineupWithFlag(/* isP0 */ false, p1FlagIdx);

  await program.methods
    .submitLineupXy(u8(xs1), u8(ys1), u8(pcs1))
    .accountsStrict({ inner: { game, registry: reg, signer: p1.publicKey } })
    .signers([p1])
    .rpc();

  const g = await program.account.game.fetch(game);
  let gDec = decodeGame(g);
  printBoard(gDec.owners, gDec.pieces);

  return { program, p0, p1, game, reg };
};
