import { submitFixedLineup } from './submitFixedLineup';
import { decodeGame, printBoard } from './cells';
import { Choice } from './types';

export const playWithTiebreak = async () => {
  const { program, p0, p1, game, reg } = await submitFixedLineup();

  // P0: (3,4) -> (3,3)
  await program.methods
    .movePieceXy(3, 4, 3, 3)
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();

  // P1: (0,1) -> (0,2)
  await program.methods
    .movePieceXy(0, 1, 0, 2)
    .accountsStrict({ game, registry: reg, signer: p1.publicKey })
    .signers([p1])
    .rpc();

  // P0: (3,3) -> (3,2)
  await program.methods
    .movePieceXy(3, 3, 3, 2)
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();

  // P1: (1,1) -> (1,2)
  await program.methods
    .movePieceXy(1, 1, 1, 2)
    .accountsStrict({ game, registry: reg, signer: p1.publicKey })
    .signers([p1])
    .rpc();

  // P0: (3,2) -> (3,1) — create tie
  await program.methods
    .movePieceXy(3, 2, 3, 1)
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();

  // tie-break: P0 Rock, P1 Scissors -> attacker wins
  await program.methods
    .chooseWeapon(Choice.Rock)
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();

  await program.methods
    .chooseWeapon(Choice.Scissors)
    .accountsStrict({ game, registry: reg, signer: p1.publicKey })
    .signers([p1])
    .rpc();

  // P1: (2,1) -> (2,2)
  await program.methods
    .movePieceXy(2, 1, 2, 2)
    .accountsStrict({ game, registry: reg, signer: p1.publicKey })
    .signers([p1])
    .rpc();

  let gMid: any = await program.account.game.fetch(game);
  let midDecoded = decodeGame(gMid);
  printBoard(midDecoded.owners, midDecoded.pieces);

  // P0: (3,1) -> (3,0)  — capture P1 flag => game end
  await program.methods
    .movePieceXy(3, 1, 3, 0)
    .accountsStrict({ game, registry: reg, signer: p0 })
    .rpc();

  // final
  const gFinal: any = await program.account.game.fetch(game);
  const finalDecoded = decodeGame(gFinal);
  printBoard(finalDecoded.owners, finalDecoded.pieces);
  console.log('Final:', finalDecoded);

  return {
    gameState: gFinal,
    decoded: finalDecoded,
  };
};
