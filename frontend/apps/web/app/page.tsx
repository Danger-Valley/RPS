"use client";
import { MOVES, decideRound, type Move } from '@rps/core';
import { useState } from 'react';

export default function HomePage() {
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [result, setResult] = useState<string>('');

  function play(move: Move) {
    const opponent = MOVES[Math.floor(Math.random() * MOVES.length)];
    setPlayerMove(move);
    setOpponentMove(opponent);
    setResult(decideRound(move, opponent));
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>RPS Onchain (Web)</h1>
      <p>Reusable core logic from <code>@rps/core</code>.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        {MOVES.map((m) => (
          <button key={m} onClick={() => play(m)} style={{ padding: 8 }}>
            {m}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <p>Player: {playerMove ?? '-'}</p>
        <p>Opponent: {opponentMove ?? '-'}</p>
        <p>Result: {result || '-'}</p>
      </div>
    </main>
  );
}

