import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { SolanaIcqRps } from '../target/types/solana_icq_rps';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

async function getProgram(): Promise<{
  provider: AnchorProvider;
  program: Program<SolanaIcqRps>;
}> {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solanaIcqRps as Program<SolanaIcqRps>;
  return {
    provider,
    program,
  };
}

export const WIDTH = 7;
export const HEIGHT = 6;
export const CELLS = WIDTH * HEIGHT;

export const Piece = {
  Empty: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
  Flag: 4,
} as const;
export type Piece = (typeof Piece)[keyof typeof Piece];

export const Owner = {
  None: 0,
  P0: 1,
  P1: 2,
} as const;
export type Owner = (typeof Owner)[keyof typeof Owner];

export const Phase = {
  Created: 0,
  Joined: 1,
  FlagP0Placed: 2,
  FlagP1Placed: 3,
  FlagsPlaced: 4,
  LineupP0Set: 5,
  LineupP1Set: 6,
  Active: 7,
  Finished: 8,
} as const;
export type Phase = (typeof Phase)[keyof typeof Phase];

export const Choice = {
  None: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
} as const;
export type Choice = (typeof Choice)[keyof typeof Choice];

const toIdx = (x: number, y: number) => y * WIDTH + x;
const toXY = (i: number) => ({ x: i % WIDTH, y: Math.floor(i / WIDTH) });
const spawnCells = (isP0: boolean) => {
  const cells: number[] = [];
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      if (isP0 ? y >= 4 : y <= 1) cells.push(toIdx(x, y));
    }
  return cells;
};
const padPieces = (base: number[], len: number) => {
  const out = base.slice();
  while (out.length < len) out.push((out.length % 3) + 1); // 1,2,3 = R,P,S
  return out;
};

const u8 = (arr: number[]) => Buffer.from(Uint8Array.from(arr));

export function board2D<T>(flat: T[]): T[][] {
  const rows: T[][] = [];
  for (let y = 0; y < HEIGHT; y++)
    rows.push(flat.slice(y * WIDTH, (y + 1) * WIDTH));
  return rows;
}

export const printBoard = (owners: Owner[], pieces: Piece[]) => {
  const sym = (o: Owner, p: Piece) => {
    if (o === Owner.None) return ' . ';
    const base =
      p === Piece.Rock
        ? 'R'
        : p === Piece.Paper
        ? 'P'
        : p === Piece.Scissors
        ? 'S'
        : 'F';
    return o === Owner.P0 ? ` ${base.toLowerCase()} ` : ` ${base} `;
  };
  const rows = board2D(
    [...Array(CELLS).keys()].map((i) => sym(owners[i], pieces[i])),
  );
  console.log('\nBoard (y=0 top):');
  for (let y = 0; y < HEIGHT; y++) console.log(rows[y].join(''));
};

export const decodeGame = (raw: any) => {
  const owners: Owner[] = (raw.boardCellsOwner as number[]).map(
    (n) => n as Owner,
  );
  const pieces: Piece[] = (raw.boardPieces as number[]).map((n) => n as Piece);

  return {
    p0: raw.player0 as string,
    p1: raw.player1 as string,
    winner: (raw.winner ? raw.winner : null) as string | null,
    phase: raw.phase as number,
    isP1Turn: Boolean(raw.isPlayer1Turn),
    owners,
    pieces,
    live0: Number(raw.livePlayer0),
    live1: Number(raw.livePlayer1),
    flagPos0: Number(raw.flagPos0),
    flagPos1: Number(raw.flagPos1),
    tiePending: Boolean(raw.tiePending),
    tieFrom: toXY(Number(raw.tieFrom)),
    tieTo: toXY(Number(raw.tieTo)),
    choiceMade0: Boolean(raw.choiceMade0),
    choiceMade1: Boolean(raw.choiceMade1),
    choice0: Number(raw.choice0) as Choice,
    choice1: Number(raw.choice1) as Choice,
  };
};

async function airdropIfNeeded(conn: Connection, pk: PublicKey, minSol = 2) {
  const bal = await conn.getBalance(pk);
  if (bal < minSol * LAMPORTS_PER_SOL) {
    const sig = await conn.requestAirdrop(pk, minSol * LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig, 'confirmed');
  }
}

function registryPda(programId: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    programId,
  );
  return pda;
}

function gamePda(programId: PublicKey, registry: PublicKey, id: number) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(id, 0);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), registry.toBuffer(), b],
    programId,
  );
  return pda;
}

function findTieMove(
  g: any,
  wantOwner: Owner,
): { fromIdx: number; toIdx: number } | null {
  const owners = g.boardCellsOwner as number[];
  const pieces = g.boardPieces as number[];

  const neighbors = (i: number) => {
    const x = i % WIDTH,
      y = Math.floor(i / WIDTH);
    const res: number[] = [];
    if (x > 0) res.push(i - 1);
    if (x + 1 < WIDTH) res.push(i + 1);
    if (y > 0) res.push(i - WIDTH);
    if (y + 1 < HEIGHT) res.push(i + WIDTH);
    return res;
  };

  for (let i = 0; i < owners.length; i++) {
    if (owners[i] !== wantOwner) continue;
    const p = pieces[i];
    if (p === Piece.Empty || p === Piece.Flag) continue;
    for (const j of neighbors(i)) {
      if (
        owners[j] === (wantOwner === Owner.P0 ? Owner.P1 : Owner.P0) &&
        pieces[j] === p
      ) {
        return { fromIdx: i, toIdx: j };
      }
    }
  }
  return null;
}

/*describe("solana-icq-rps", () => {
  it("createGame → joinGame → placeFlag(p0,p1)", async () => {
    const {program, provider} = await getProgram();
    const conn = provider.connection;

    const p0 = (provider.wallet as anchor.Wallet).publicKey;
    const p1 = Keypair.generate();
    await airdropIfNeeded(conn, p0, 2);
    await airdropIfNeeded(conn, p1.publicKey, 2);

    const regPda = registryPda(program.programId);
    let nextId = 0;
    try {
      const reg: any = await program.account.registry.fetch(regPda);
      nextId = Number(reg.nextGameId);
    } catch {}

    const gPda = gamePda(program.programId, regPda, nextId);

    // create
    await program.methods.createGame()
        .accountsStrict({ registry: regPda, game: gPda, payer: p0, systemProgram: anchor.web3.SystemProgram.programId })
        .rpc();

    // join
    await program.methods.joinGame()
        .accountsStrict({ game: gPda, registry: regPda, joiner: p1.publicKey })
        .signers([p1])
        .rpc();

    // place_flag p0 @ (3,5)
    const p0Idx = 5 * 7 + 3;
    await program.methods.placeFlag(p0Idx)
        .accountsStrict({ game: gPda, registry: regPda, signer: p0 })
        .rpc();

    // place_flag p1 @ (3,0)
    const p1Idx = 0 * 7 + 3;
    await program.methods.placeFlag(p1Idx)
        .accountsStrict({ game: gPda, registry: regPda, signer: p1.publicKey })
        .signers([p1])
        .rpc();

    const g: any = await program.account.game.fetch(gPda);
    console.log('g: ', g)

    if (Number(g.flagPos0) !== p0Idx) throw new Error("P0 flag mismatch");
    if (Number(g.flagPos1) !== p1Idx) throw new Error("P1 flag mismatch");
  });
});*/

/*describe("submit fixed lineup", () => {
  it("both players submit → phase Active", async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solanaIcqRps as Program<SolanaIcqRps>;
    const conn = provider.connection;

    const p0 = (provider.wallet as anchor.Wallet).publicKey;
    const p1 = Keypair.generate();
    await airdropIfNeeded(conn, p0); await airdropIfNeeded(conn, p1.publicKey);

    const reg = registryPda(program.programId);
    let nextId = 0;
    try { const r: any = await program.account.registry.fetch(reg); nextId = Number(r.nextGameId); } catch {}

    const game = gamePda(program.programId, reg, nextId);

    // create + join
    await program.methods.createGame()
        .accountsStrict({ registry: reg, game, payer: p0, systemProgram: anchor.web3.SystemProgram.programId })
        .rpc();
    await program.methods.joinGame()
        .accountsStrict({ game, registry: reg, joiner: p1.publicKey })
        .signers([p1]).rpc();

    // flags (як раніше)
    await program.methods.placeFlag(toIdx(3,5)).accountsStrict({ game, registry: reg, signer: p0 }).rpc();
    await program.methods.placeFlag(toIdx(3,0)).accountsStrict({ game, registry: reg, signer: p1.publicKey }).signers([p1]).rpc();

    // lineup p0
    let g: any = await program.account.game.fetch(game);
    const flag0 = Number(g.flagPos0);
    const flag1 = Number(g.flagPos1);

    const cells0 = spawnCells(true).filter(i => i !== flag0);
    const xs0 = cells0.map(i => toXY(i).x);
    const ys0 = cells0.map(i => toXY(i).y);
    const pcs0 = padPieces([], cells0.length); // 1..3
    await program.methods.submitLineupXy(
        u8(xs0),
        u8(ys0),
        u8(pcs0)
    )
        .accountsStrict({ inner: { game, registry: reg, signer: p0 } })
        .rpc();

    // lineup p1
    const cells1 = spawnCells(false).filter(i => i !== flag1);
    const xs1 = cells1.map(i => toXY(i).x);
    const ys1 = cells1.map(i => toXY(i).y);
    const pcs1 = padPieces([], cells1.length);
    await program.methods.submitLineupXy(
        u8(xs1),
        u8(ys1),
        u8(pcs1)
    )
        .accountsStrict({ inner: { game, registry: reg, signer: p1.publicKey } })
        .signers([p1])
        .rpc();

    g = await program.account.game.fetch(game);
    console.log('g: ', g)
    if (Number(g.phase) !== 7) throw new Error("Game is not Active after both lineups");
    if (g.isPlayer1Turn !== false) throw new Error("isPlayer1Turn should be false at start");
  });
});*/

/*describe('basic moves', () => {
  it('p0 and p1 make simple moves into empty cells', async () => {
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

    // flags (як раніше)
    await program.methods
      .placeFlag(toIdx(3, 5))
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();
    await program.methods
      .placeFlag(toIdx(3, 0))
      .accountsStrict({ game, registry: reg, signer: p1.publicKey })
      .signers([p1])
      .rpc();

    // lineup p0
    let g: any = await program.account.game.fetch(game);
    const flag0 = Number(g.flagPos0);
    const flag1 = Number(g.flagPos1);

    const cells0 = spawnCells(true).filter((i) => i !== flag0);
    const xs0 = cells0.map((i) => toXY(i).x);
    const ys0 = cells0.map((i) => toXY(i).y);
    const pcs0 = padPieces([], cells0.length); // 1..3
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

    // P0: (0,4) -> (0,3)
    await program.methods
      .movePieceXy(0, 4, 0, 3)
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();

    g = await program.account.game.fetch(game);
    gDec = decodeGame(g);
    printBoard(gDec.owners, gDec.pieces);

    // P1: (1,1) -> (1,2)
    await program.methods
      .movePieceXy(1, 1, 1, 2)
      .accountsStrict({ game, registry: reg, signer: p1.publicKey })
      .signers([p1])
      .rpc();

    g = await program.account.game.fetch(game);
    gDec = decodeGame(g);
    printBoard(gDec.owners, gDec.pieces);

    // P0: (0,3) -> (0,2)
    await program.methods
      .movePieceXy(0, 3, 0, 2)
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();

    g = await program.account.game.fetch(game);
    gDec = decodeGame(g);
    printBoard(gDec.owners, gDec.pieces);
  });
});*/

describe('play with tiebreak', () => {
  it('causes a tie and resolves it via choose_weapon', async () => {
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

    // flags (як раніше)
    await program.methods
      .placeFlag(toIdx(3, 5))
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();
    await program.methods
      .placeFlag(toIdx(3, 0))
      .accountsStrict({ game, registry: reg, signer: p1.publicKey })
      .signers([p1])
      .rpc();

    // lineup p0
    let g: any = await program.account.game.fetch(game);
    const flag0 = Number(g.flagPos0);
    const flag1 = Number(g.flagPos1);

    const cells0 = spawnCells(true).filter((i) => i !== flag0);
    const xs0 = cells0.map((i) => toXY(i).x);
    const ys0 = cells0.map((i) => toXY(i).y);
    const pcs0 = padPieces([], cells0.length); // 1..3
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

    // P0: (3,2) -> (3,1) — цей крок має викликати tie
    await program.methods
      .movePieceXy(3, 2, 3, 1)
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();

    // 6) тай-брейк: P0 Rock, P1 Scissors → перемагає атакер
    await program.methods
      .chooseWeapon(Choice.Rock)
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();

    await program.methods
      .chooseWeapon(Choice.Scissors)
      .accountsStrict({ game, registry: reg, signer: p1.publicKey })
      .signers([p1])
      .rpc();

    // 7) P1: (2,1) -> (2,2)
    await program.methods
      .movePieceXy(2, 1, 2, 2)
      .accountsStrict({ game, registry: reg, signer: p1.publicKey })
      .signers([p1])
      .rpc();

    // друк стану
    g = await program.account.game.fetch(game);
    const dec3 = decodeGame(g);
    printBoard(dec3.owners, dec3.pieces);

    // 8) P0: (3,1) -> (3,0) — захоплення прапора P1, кінець гри
    await program.methods
      .movePieceXy(3, 1, 3, 0)
      .accountsStrict({ game, registry: reg, signer: p0 })
      .rpc();

    const g4: any = await program.account.game.fetch(game);
    const dec4 = decodeGame(g4);
    printBoard(dec4.owners, dec4.pieces);
    console.log('dec4: ', dec4);
  });
});
