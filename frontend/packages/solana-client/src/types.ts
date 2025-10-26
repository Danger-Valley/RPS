/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_icq_rps.json`.
 */
export type SolanaIcqRps = {
    "address": "EtVowPYxob9DUnWURwMFbeVBsECBywunU5iumgqB8JPK",
    "metadata": {
      "name": "solanaIcqRps",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "chooseWeapon",
        "discriminator": [
          164,
          234,
          168,
          4,
          102,
          6,
          237,
          218
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "choice",
            "type": "u8"
          }
        ]
      },
      {
        "name": "createGame",
        "discriminator": [
          124,
          69,
          75,
          66,
          184,
          220,
          72,
          206
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    103,
                    97,
                    109,
                    101
                  ]
                },
                {
                  "kind": "account",
                  "path": "payer"
                }
              ]
            }
          },
          {
            "name": "payer",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "joinGame",
        "discriminator": [
          107,
          112,
          18,
          38,
          56,
          173,
          60,
          123
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "joiner",
            "signer": true
          }
        ],
        "args": []
      },
      {
        "name": "movePiece",
        "discriminator": [
          102,
          6,
          25,
          184,
          133,
          134,
          142,
          168
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "fromX",
            "type": "u8"
          },
          {
            "name": "fromY",
            "type": "u8"
          },
          {
            "name": "toX",
            "type": "u8"
          },
          {
            "name": "toY",
            "type": "u8"
          }
        ]
      },
      {
        "name": "movePieceXy",
        "discriminator": [
          102,
          6,
          25,
          184,
          133,
          134,
          142,
          168
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "fromX",
            "type": "u8"
          },
          {
            "name": "fromY",
            "type": "u8"
          },
          {
            "name": "toX",
            "type": "u8"
          },
          {
            "name": "toY",
            "type": "u8"
          }
        ]
      },
      {
        "name": "placeFlag",
        "discriminator": [
          203,
          72,
          78,
          66,
          127,
          38,
          21,
          169
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "x",
            "type": "u8"
          },
          {
            "name": "y",
            "type": "u8"
          }
        ]
      },
      {
        "name": "placeFlagXy",
        "discriminator": [
          203,
          72,
          78,
          66,
          127,
          38,
          21,
          169
        ],
        "accounts": [
          {
            "name": "inner",
            "type": {
              "defined": "PlaceFlag"
            }
          }
        ],
        "args": [
          {
            "name": "x",
            "type": "u8"
          },
          {
            "name": "y",
            "type": "u8"
          }
        ]
      },
      {
        "name": "submitLineup",
        "discriminator": [
          203,
          72,
          78,
          66,
          127,
          38,
          21,
          169
        ],
        "accounts": [
          {
            "name": "game",
            "writable": true
          },
          {
            "name": "signer",
            "signer": true
          }
        ],
        "args": [
          {
            "name": "positions",
            "type": {
              "vec": "u8"
            }
          },
          {
            "name": "pieces",
            "type": {
              "vec": "u8"
            }
          }
        ]
      },
      {
        "name": "submitLineupXy",
        "discriminator": [
          203,
          72,
          78,
          66,
          127,
          38,
          21,
          169
        ],
        "accounts": [
          {
            "name": "inner",
            "type": {
              "defined": "SubmitLineup"
            }
          }
        ],
        "args": [
          {
            "name": "xs",
            "type": {
              "vec": "u8"
            }
          },
          {
            "name": "ys",
            "type": {
              "vec": "u8"
            }
          },
          {
            "name": "pieces",
            "type": {
              "vec": "u8"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "Game",
        "type": {
          "fields": [
            {
              "name": "player0",
              "type": "pubkey"
            },
            {
              "name": "player1",
              "type": "pubkey"
            },
            {
              "name": "winner",
              "type": {
                "option": "pubkey"
              }
            },
            {
              "name": "phase",
              "type": "u8"
            },
            {
              "name": "isPlayer1Turn",
              "type": "bool"
            },
            {
              "name": "boardCellsOwner",
              "type": {
                "array": [
                  "u8",
                  42
                ]
              }
            },
            {
              "name": "boardPieces",
              "type": {
                "array": [
                  "u8",
                  42
                ]
              }
            },
            {
              "name": "livePlayer0",
              "type": "u16"
            },
            {
              "name": "livePlayer1",
              "type": "u16"
            },
            {
              "name": "flagPos0",
              "type": "u8"
            },
            {
              "name": "flagPos1",
              "type": "u8"
            },
            {
              "name": "tiePending",
              "type": "bool"
            },
            {
              "name": "tieFrom",
              "type": "u8"
            },
            {
              "name": "tieTo",
              "type": "u8"
            },
            {
              "name": "choiceMade0",
              "type": "bool"
            },
            {
              "name": "choiceMade1",
              "type": "bool"
            },
            {
              "name": "choice0",
              "type": "u8"
            },
            {
              "name": "choice1",
              "type": "u8"
            }
          ]
        }
      }
    ],
    "types": [
      {
        "name": "PlaceFlag",
        "type": {
          "fields": [
            {
              "name": "game",
              "type": {
                "defined": "Game"
              }
            },
            {
              "name": "signer",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "SubmitLineup",
        "type": {
          "fields": [
            {
              "name": "game",
              "type": {
                "defined": "Game"
              }
            },
            {
              "name": "signer",
              "type": "pubkey"
            }
          ]
        }
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "BadCell",
        "msg": "Invalid cell index"
      },
      {
        "code": 6001,
        "name": "CellTaken",
        "msg": "Cell is already occupied"
      },
      {
        "code": 6002,
        "name": "NotParticipant",
        "msg": "Not a participant in this game"
      },
      {
        "code": 6003,
        "name": "BadPhase",
        "msg": "Invalid game phase"
      },
      {
        "code": 6004,
        "name": "Player0BadRow",
        "msg": "Player 0 can only place pieces in bottom rows"
      },
      {
        "code": 6005,
        "name": "Player1BadRow",
        "msg": "Player 1 can only place pieces in top rows"
      },
      {
        "code": 6006,
        "name": "OnlyRpsAllowed",
        "msg": "Only Rock, Paper, Scissors allowed"
      },
      {
        "code": 6007,
        "name": "MustHaveExactlyOneFlag",
        "msg": "Must have exactly one flag"
      },
      {
        "code": 6008,
        "name": "LineupLengthMismatch",
        "msg": "Lineup length mismatch"
      },
      {
        "code": 6009,
        "name": "LineupPositionsEmpty",
        "msg": "Lineup positions cannot be empty"
      },
      {
        "code": 6010,
        "name": "Player0LineupAlreadyPlaced",
        "msg": "Player 0 lineup already placed"
      },
      {
        "code": 6011,
        "name": "Player1LineupAlreadyPlaced",
        "msg": "Player 1 lineup already placed"
      },
      {
        "code": 6012,
        "name": "NotAllowedJoinGame",
        "msg": "Not allowed to join this game"
      },
      {
        "code": 6013,
        "name": "Overflow",
        "msg": "Arithmetic overflow"
      }
    ]
  };

// Game constants and types
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
      if (isP0 ? y >= 4 : y <= 1) {
        cells.push(toIdx(x, y));
      }
    }
  return cells;
};

export const padPieces = (pieces: number[], len: number) => {
  const out: number[] = [...pieces];
  for (let k = pieces.length; k < len; k++) {
    out.push((k % 3) + 1); // 1=Rock,2=Paper,3=Scissors
  }
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

export const printGameBoard = printBoard;

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