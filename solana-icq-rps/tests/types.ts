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
