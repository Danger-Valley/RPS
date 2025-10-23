// Re-export types from the smart contract
export type SolanaIcqRps = {
  "address": "EGayg9wGidJLkmUF98VNv167EBqyZ59TuXVAxjEopGGE",
  "metadata": {
    "name": "solanaIcqRps",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "chooseWeapon",
      "discriminator": [164, 234, 168, 4, 102, 6, 237, 218],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 97, 109, 101] },
              { "kind": "account", "path": "registry" },
              { "kind": "account", "path": "game.id", "account": "game" }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
            ]
          }
        },
        { "name": "signer", "signer": true }
      ],
      "args": [{ "name": "choice", "type": "u8" }]
    },
    {
      "name": "createGame",
      "discriminator": [124, 69, 75, 66, 184, 220, 72, 206],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
            ]
          }
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 97, 109, 101] },
              { "kind": "account", "path": "registry" },
              { "kind": "account", "path": "registry.next_game_id", "account": "registry" }
            ]
          }
        },
        { "name": "payer", "writable": true, "signer": true },
        { "name": "systemProgram", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    },
    {
      "name": "joinGame",
      "discriminator": [107, 112, 18, 38, 56, 173, 60, 128],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 97, 109, 101] },
              { "kind": "account", "path": "registry" },
              { "kind": "account", "path": "game.id", "account": "game" }
            ]
          }
        },
        {
          "name": "registry",
          "docs": ["CHECK"],
          "pda": {
            "seeds": [
              { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
            ]
          }
        },
        { "name": "joiner", "signer": true }
      ],
      "args": []
    },
    {
      "name": "movePieceXy",
      "discriminator": [153, 197, 91, 226, 244, 30, 250, 90],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 97, 109, 101] },
              { "kind": "account", "path": "registry" },
              { "kind": "account", "path": "game.id", "account": "game" }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
            ]
          }
        },
        { "name": "signer", "signer": true }
      ],
      "args": [
        { "name": "fromX", "type": "u8" },
        { "name": "fromY", "type": "u8" },
        { "name": "toX", "type": "u8" },
        { "name": "toY", "type": "u8" }
      ]
    },
    {
      "name": "placeFlagXy",
      "discriminator": [137, 10, 199, 122, 12, 112, 26, 51],
      "accounts": [
        {
          "name": "inner",
          "accounts": [
            {
              "name": "game",
              "writable": true,
              "pda": {
                "seeds": [
                  { "kind": "const", "value": [103, 97, 109, 101] },
                  { "kind": "account", "path": "registry" },
                  { "kind": "account", "path": "game.id", "account": "game" }
                ]
              }
            },
            {
              "name": "registry",
              "pda": {
                "seeds": [
                  { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
                ]
              }
            },
            { "name": "signer", "signer": true }
          ]
        }
      ],
      "args": [
        { "name": "x", "type": "u8" },
        { "name": "y", "type": "u8" }
      ]
    },
    {
      "name": "submitLineupXy",
      "discriminator": [98, 53, 146, 241, 203, 192, 21, 52],
      "accounts": [
        {
          "name": "inner",
          "accounts": [
            {
              "name": "game",
              "writable": true,
              "pda": {
                "seeds": [
                  { "kind": "const", "value": [103, 97, 109, 101] },
                  { "kind": "account", "path": "registry" },
                  { "kind": "account", "path": "game.id", "account": "game" }
                ]
              }
            },
            {
              "name": "registry",
              "pda": {
                "seeds": [
                  { "kind": "const", "value": [114, 101, 103, 105, 115, 116, 114, 121] }
                ]
              }
            },
            { "name": "signer", "signer": true }
          ]
        }
      ],
      "args": [
        { "name": "xs", "type": "bytes" },
        { "name": "ys", "type": "bytes" },
        { "name": "pieces", "type": "bytes" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [27, 90, 166, 125, 74, 100, 121, 18]
    },
    {
      "name": "registry",
      "discriminator": [47, 174, 110, 246, 184, 182, 252, 218]
    }
  ],
  "events": [
    {
      "name": "battle",
      "discriminator": [139, 69, 188, 38, 198, 175, 195, 40]
    },
    {
      "name": "flagPlaced",
      "discriminator": [19, 129, 248, 195, 223, 88, 59, 219]
    },
    {
      "name": "gameCreated",
      "discriminator": [218, 25, 150, 94, 177, 112, 96, 2]
    },
    {
      "name": "gameJoined",
      "discriminator": [111, 242, 51, 235, 66, 43, 140, 84]
    },
    {
      "name": "gameOver",
      "discriminator": [122, 28, 20, 209, 123, 166, 111, 64]
    },
    {
      "name": "gameStarted",
      "discriminator": [222, 247, 78, 255, 61, 184, 156, 41]
    },
    {
      "name": "lineupSubmitted",
      "discriminator": [19, 121, 250, 4, 64, 40, 76, 233]
    },
    {
      "name": "moveMade",
      "discriminator": [63, 69, 224, 215, 118, 250, 136, 241]
    },
    {
      "name": "tieChoice",
      "discriminator": [227, 166, 56, 29, 72, 230, 93, 38]
    },
    {
      "name": "tieResolved",
      "discriminator": [199, 157, 148, 87, 4, 237, 234, 89]
    },
    {
      "name": "tieStarted",
      "discriminator": [99, 40, 243, 91, 1, 73, 81, 193]
    }
  ],
  "errors": [
    { "code": 6000, "name": "invalidGameId", "msg": "Invalid game id" },
    { "code": 6001, "name": "notAllowedJoinGame", "msg": "Not allowed to join game" },
    { "code": 6002, "name": "placeFlagDeadlinePassed", "msg": "Place flag deadline passed" },
    { "code": 6003, "name": "badCell", "msg": "Bad cell" },
    { "code": 6004, "name": "badPhase", "msg": "Bad phase" },
    { "code": 6005, "name": "noGame", "msg": "No such game" },
    { "code": 6006, "name": "cellTaken", "msg": "Cell already taken" },
    { "code": 6007, "name": "notParticipant", "msg": "Not a participant" },
    { "code": 6008, "name": "player0BadRow", "msg": "Player0: bad row" },
    { "code": 6009, "name": "player1BadRow", "msg": "Player1: bad row" },
    { "code": 6010, "name": "player0FlagAlreadyPlaced", "msg": "Player0 flag already placed" },
    { "code": 6011, "name": "player1FlagAlreadyPlaced", "msg": "Player1 flag already placed" },
    { "code": 6012, "name": "player0LineupAlreadyPlaced", "msg": "Player0 lineup already placed" },
    { "code": 6013, "name": "player1LineupAlreadyPlaced", "msg": "Player1 lineup already placed" },
    { "code": 6014, "name": "lineupLengthMismatch", "msg": "Lineup length mismatch" },
    { "code": 6015, "name": "lineupPositionsEmpty", "msg": "Lineup positions empty" },
    { "code": 6016, "name": "onlyRpsAllowed", "msg": "Only R/P/S allowed" },
    { "code": 6017, "name": "gameNotActive", "msg": "Game not active" },
    { "code": 6018, "name": "tieInProgress", "msg": "Tie in progress" },
    { "code": 6019, "name": "invalidMove", "msg": "Invalid move" },
    { "code": 6020, "name": "notYourTurn", "msg": "Not your turn" },
    { "code": 6021, "name": "cannotStackOwnPiece", "msg": "Cannot stack own piece" },
    { "code": 6022, "name": "noTiePending", "msg": "No tie pending" },
    { "code": 6023, "name": "alreadyChose", "msg": "Already chose" },
    { "code": 6024, "name": "overflow", "msg": "overflow" }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "id", "type": "u32" },
          { "name": "player0", "type": "pubkey" },
          { "name": "player1", "type": "pubkey" },
          { "name": "winner", "type": { "option": "pubkey" } },
          { "name": "phase", "type": "u8" },
          { "name": "isPlayer1Turn", "type": "bool" },
          { "name": "boardCellsOwner", "type": { "array": ["u8", 42] } },
          { "name": "boardPieces", "type": { "array": ["u8", 42] } },
          { "name": "livePlayer0", "type": "u16" },
          { "name": "livePlayer1", "type": "u16" },
          { "name": "flagPos0", "type": "u8" },
          { "name": "flagPos1", "type": "u8" },
          { "name": "tiePending", "type": "bool" },
          { "name": "tieFrom", "type": "u8" },
          { "name": "tieTo", "type": "u8" },
          { "name": "choiceMade0", "type": "bool" },
          { "name": "choiceMade1", "type": "bool" },
          { "name": "choice0", "type": "u8" },
          { "name": "choice1", "type": "u8" }
        ]
      }
    },
    {
      "name": "registry",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "nextGameId", "type": "u32" }
        ]
      }
    },
    {
      "name": "choice",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "none" },
          { "name": "rock" },
          { "name": "paper" },
          { "name": "scissors" }
        ]
      }
    },
    {
      "name": "piece",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "empty" },
          { "name": "rock" },
          { "name": "paper" },
          { "name": "scissors" },
          { "name": "flag" }
        ]
      }
    }
  ]
};

// Game constants
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

// Utility functions
export const toIdx = (x: number, y: number) => y * WIDTH + x;
export const toXY = (i: number) => ({ x: i % WIDTH, y: Math.floor(i / WIDTH) });

export const spawnCells = (isP0: boolean) => {
  const cells: number[] = [];
  for (let y = 0; y < HEIGHT; y++)
    for (let x = 0; x < WIDTH; x++) {
      if (isP0 ? y >= 4 : y <= 1) cells.push(toIdx(x, y));
    }
  return cells;
};

export const padPieces = (base: number[], len: number) => {
  const out = base.slice();
  while (out.length < len) out.push((out.length % 3) + 1); // 1,2,3 = R,P,S
  return out;
};

export const u8 = (arr: number[]) => Buffer.from(Uint8Array.from(arr));

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
