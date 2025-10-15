export type Move = 'rock' | 'paper' | 'scissors';

export type RoundResult = 'win' | 'lose' | 'draw';

export function decideRound(player: Move, opponent: Move): RoundResult {
  if (player === opponent) return 'draw';
  if (
    (player === 'rock' && opponent === 'scissors') ||
    (player === 'paper' && opponent === 'rock') ||
    (player === 'scissors' && opponent === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

export function isMove(input: string): input is Move {
  return input === 'rock' || input === 'paper' || input === 'scissors';
}

export const MOVES: readonly Move[] = ['rock', 'paper', 'scissors'] as const;

