"use client";
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import RpsFigure, { Weapon } from './RpsFigure';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const rows = 6;
  const cols = 7;
  const cells = useMemo(() => Array.from({ length: rows * cols }), []);

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(700px, 1fr) 340px',
      gap: 24,
      padding: 24,
      minHeight: '100dvh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <section>
        <h2 style={{ color: '#66fcf1', marginTop: 0 }}>Game #{id}</h2>
        <div
          style={{
            width: '100%',
            maxWidth: 840,
            aspectRatio: `${cols} / ${rows}`,
            background: 'transparent',
            border: '1px solid #2b3a44',
            borderRadius: 8,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {cells.map((_, i) => {
            const row = Math.floor(i / cols); // 0..5
            const col = i % cols;           // 0..6
            const showFigure = row === 0 || row === 1 || row === 4 || row === 5;
            const weapon = ((row + col) % 4) as Weapon;
            return (
              <div
                key={i}
                style={{
                  border: '1px solid #2b3a44',
                  background: i % 2 === 0 ? '#11171c' : '#0e1419',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                {showFigure && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transform: 'translateY(-1%)' }}>
                    <RpsFigure
                      weapon={weapon}
                      style={{ width: '90%', height: '90%', transform: 'scale(1.9)', transformOrigin: 'bottom center' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <aside style={{ display: 'grid', gap: 24 }}>
        <div style={{ height: 160, background: '#0e1419', border: '1px solid #2b3a44', borderRadius: 8, padding: 12 }}>
          <strong style={{ color: '#c5c6c7' }}>Logo</strong>
        </div>
        <div style={{ height: 260, background: '#0e1419', border: '1px solid #2b3a44', borderRadius: 8, padding: 12 }}>
          <strong style={{ color: '#c5c6c7' }}>Turn / Side</strong>
        </div>
        <div style={{ height: 200, background: '#0e1419', border: '1px solid #2b3a44', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 64, color: '#ffffff' }}>10</span>
        </div>
      </aside>
    </main>
  );
}


