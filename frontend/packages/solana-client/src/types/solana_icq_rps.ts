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
          128
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
          136,
          133,
          16,
          117,
          173,
          226,
          233,
          76
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
            "name": "fromIdx",
            "type": "u8"
          },
          {
            "name": "toIdx",
            "type": "u8"
          }
        ]
      },
      {
        "name": "movePieceXy",
        "discriminator": [
          153,
          197,
          91,
          226,
          244,
          30,
          250,
          90
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
        "name": "submitLineup",
        "discriminator": [
          199,
          25,
          29,
          17,
          88,
          107,
          108,
          107
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
            "type": "bytes"
          },
          {
            "name": "pieces",
            "type": "bytes"
          }
        ]
      },
      {
        "name": "submitLineupXy",
        "discriminator": [
          98,
          53,
          146,
          241,
          203,
          192,
          21,
          52
        ],
        "accounts": [
          {
            "name": "inner",
            "accounts": [
              {
                "name": "game",
                "writable": true
              },
              {
                "name": "signer",
                "signer": true
              }
            ]
          }
        ],
        "args": [
          {
            "name": "xs",
            "type": "bytes"
          },
          {
            "name": "ys",
            "type": "bytes"
          },
          {
            "name": "pieces",
            "type": "bytes"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "game",
        "discriminator": [
          27,
          90,
          166,
          125,
          74,
          100,
          121,
          18
        ]
      }
    ],
    "events": [
      {
        "name": "battle",
        "discriminator": [
          139,
          69,
          188,
          38,
          198,
          175,
          195,
          40
        ]
      },
      {
        "name": "flagPlaced",
        "discriminator": [
          19,
          129,
          248,
          195,
          223,
          88,
          59,
          219
        ]
      },
      {
        "name": "gameCreated",
        "discriminator": [
          218,
          25,
          150,
          94,
          177,
          112,
          96,
          2
        ]
      },
      {
        "name": "gameJoined",
        "discriminator": [
          111,
          242,
          51,
          235,
          66,
          43,
          140,
          84
        ]
      },
      {
        "name": "gameOver",
        "discriminator": [
          122,
          28,
          20,
          209,
          123,
          166,
          111,
          64
        ]
      },
      {
        "name": "gameStarted",
        "discriminator": [
          222,
          247,
          78,
          255,
          61,
          184,
          156,
          41
        ]
      },
      {
        "name": "lineupSubmitted",
        "discriminator": [
          19,
          121,
          250,
          4,
          64,
          40,
          76,
          233
        ]
      },
      {
        "name": "moveMade",
        "discriminator": [
          63,
          69,
          224,
          215,
          118,
          250,
          136,
          241
        ]
      },
      {
        "name": "tieChoice",
        "discriminator": [
          227,
          166,
          56,
          29,
          72,
          230,
          93,
          38
        ]
      },
      {
        "name": "tieResolved",
        "discriminator": [
          199,
          157,
          148,
          87,
          4,
          237,
          234,
          89
        ]
      },
      {
        "name": "tieStarted",
        "discriminator": [
          99,
          40,
          243,
          91,
          1,
          73,
          81,
          193
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "invalidGameId",
        "msg": "Invalid game id"
      },
      {
        "code": 6001,
        "name": "notAllowedJoinGame",
        "msg": "Not allowed to join game"
      },
      {
        "code": 6002,
        "name": "placeFlagDeadlinePassed",
        "msg": "Place flag deadline passed"
      },
      {
        "code": 6003,
        "name": "badCell",
        "msg": "Bad cell"
      },
      {
        "code": 6004,
        "name": "badPhase",
        "msg": "Bad phase"
      },
      {
        "code": 6005,
        "name": "noGame",
        "msg": "No such game"
      },
      {
        "code": 6006,
        "name": "cellTaken",
        "msg": "Cell already taken"
      },
      {
        "code": 6007,
        "name": "notParticipant",
        "msg": "Not a participant"
      },
      {
        "code": 6008,
        "name": "player0BadRow",
        "msg": "Player0: bad row"
      },
      {
        "code": 6009,
        "name": "player1BadRow",
        "msg": "Player1: bad row"
      },
      {
        "code": 6010,
        "name": "player0FlagAlreadyPlaced",
        "msg": "Player0 flag already placed"
      },
      {
        "code": 6011,
        "name": "player1FlagAlreadyPlaced",
        "msg": "Player1 flag already placed"
      },
      {
        "code": 6012,
        "name": "player0LineupAlreadyPlaced",
        "msg": "Player0 lineup already placed"
      },
      {
        "code": 6013,
        "name": "player1LineupAlreadyPlaced",
        "msg": "Player1 lineup already placed"
      },
      {
        "code": 6014,
        "name": "lineupLengthMismatch",
        "msg": "Lineup length mismatch"
      },
      {
        "code": 6015,
        "name": "lineupPositionsEmpty",
        "msg": "Lineup positions empty"
      },
      {
        "code": 6016,
        "name": "onlyRpsAllowed",
        "msg": "Only R/P/S allowed"
      },
      {
        "code": 6017,
        "name": "gameNotActive",
        "msg": "Game not active"
      },
      {
        "code": 6018,
        "name": "tieInProgress",
        "msg": "Tie in progress"
      },
      {
        "code": 6019,
        "name": "invalidMove",
        "msg": "Invalid move"
      },
      {
        "code": 6020,
        "name": "notYourTurn",
        "msg": "Not your turn"
      },
      {
        "code": 6021,
        "name": "cannotStackOwnPiece",
        "msg": "Cannot stack own piece"
      },
      {
        "code": 6022,
        "name": "noTiePending",
        "msg": "No tie pending"
      },
      {
        "code": 6023,
        "name": "alreadyChose",
        "msg": "Already chose"
      },
      {
        "code": 6024,
        "name": "overflow",
        "msg": "overflow"
      },
      {
        "code": 6025,
        "name": "mustHaveExactlyOneFlag",
        "msg": "You must include exactly one Flag in your lineup"
      }
    ],
    "types": [
      {
        "name": "battle",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "fromIdx",
              "type": "u8"
            },
            {
              "name": "toIdx",
              "type": "u8"
            },
            {
              "name": "attacker",
              "type": {
                "defined": {
                  "name": "piece"
                }
              }
            },
            {
              "name": "defender",
              "type": {
                "defined": {
                  "name": "piece"
                }
              }
            },
            {
              "name": "outcome",
              "type": "i8"
            }
          ]
        }
      },
      {
        "name": "choice",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "none"
            },
            {
              "name": "rock"
            },
            {
              "name": "paper"
            },
            {
              "name": "scissors"
            }
          ]
        }
      },
      {
        "name": "flagPlaced",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "id",
              "type": "u32"
            },
            {
              "name": "player",
              "type": "pubkey"
            },
            {
              "name": "idx",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "game",
        "type": {
          "kind": "struct",
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
      },
      {
        "name": "gameCreated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "gameJoined",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "participant",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "gameOver",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "winner",
              "type": "pubkey"
            },
            {
              "name": "reason",
              "type": "string"
            }
          ]
        }
      },
      {
        "name": "gameStarted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "p0",
              "type": "pubkey"
            },
            {
              "name": "p1",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "lineupSubmitted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "player",
              "type": "pubkey"
            },
            {
              "name": "count",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "moveMade",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "player",
              "type": "pubkey"
            },
            {
              "name": "fromIdx",
              "type": "u8"
            },
            {
              "name": "toIdx",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "piece",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "empty"
            },
            {
              "name": "rock"
            },
            {
              "name": "paper"
            },
            {
              "name": "scissors"
            },
            {
              "name": "flag"
            }
          ]
        }
      },
      {
        "name": "tieChoice",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "player",
              "type": "pubkey"
            },
            {
              "name": "choice",
              "type": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          ]
        }
      },
      {
        "name": "tieResolved",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "outcome",
              "type": "i8"
            },
            {
              "name": "p0Choice",
              "type": {
                "defined": {
                  "name": "choice"
                }
              }
            },
            {
              "name": "p1Choice",
              "type": {
                "defined": {
                  "name": "choice"
                }
              }
            }
          ]
        }
      },
      {
        "name": "tieStarted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "fromIdx",
              "type": "u8"
            },
            {
              "name": "toIdx",
              "type": "u8"
            }
          ]
        }
      }
    ]
  };
  