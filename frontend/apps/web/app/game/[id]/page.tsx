"use client";
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import RpsFigure, { Weapon } from './RpsFigure';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const rows = 6;
  const cols = 7;
  const cells = useMemo(() => Array.from({ length: rows * cols }), []);

  const cellData = useMemo(() => {
    return cells.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const showFigure = row === 0 || row === 1 || row === 4 || row === 5;
      const weapon = ((row + col) % 4) as Weapon;
      return { row, col, showFigure, weapon, key: i };
    });
  }, [cells, cols]);

  // Animation trigger - track which figure should animate
  const [animatingFigure, setAnimatingFigure] = useState<number | null>(null);

  const handleCellClick = (cellKey: number) => {
    console.log('Cell clicked:', cellKey);
    // Clear any existing animation first
    setAnimatingFigure(null);
    // Set the new animation after a small delay to ensure state update
    setTimeout(() => {
      setAnimatingFigure(cellKey);
      // Reset trigger after animation completes
      setTimeout(() => {
        console.log('Resetting animation trigger for cell:', cellKey);
        setAnimatingFigure(null);
      }, 2000);
    }, 10);
  };


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
          {cellData.map(({ row, col, showFigure, weapon, key }) => (
            <div
              key={key}
              style={{
                border: '1px solid #2b3a44',
                background: key % 2 === 0 ? '#11171c' : '#0e1419',
                position: 'relative',
                overflow: 'visible',
                cursor: 'pointer'
              }}
              onClick={() => handleCellClick(key)}
            >
              {showFigure && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'center', 
                    transform: 'translateY(-1%)',
                    pointerEvents: 'none' // Make figure unclickable
                  }}
                >
                  <RpsFigure
                    weapon={weapon}
                    trigger={animatingFigure === key ? 'Jump Forward' : undefined}
                    style={{ width: '90%', height: '90%', transform: 'scale(1.9)', transformOrigin: 'bottom center' }}
                  />
                </div>
              )}
            </div>
          ))}
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


