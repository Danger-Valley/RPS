"use client";
import { useMemo, useState, useEffect } from 'react';
import { useRiveFile } from '@rive-app/react-canvas';
import { useParams } from 'next/navigation';
import RpsFigure, { Weapon } from './RpsFigure';

interface Figure {
  id: string;
  row: number;
  col: number;
  weapon: Weapon;
  isMyFigure: boolean;
  isAlive: boolean;
  isMoving?: boolean;
  oldRow?: number;
  oldCol?: number;
  animX?: number;
  animY?: number;
}

export default function GamePage() {
  // Load shared Rive file once and share across all figures
  const { riveFile, status: riveStatus } = useRiveFile({ src: '/figures/fig1.riv' });
  const { id } = useParams<{ id: string }>();
  const rows = 6;
  const cols = 7;
  const cells = useMemo(() => Array.from({ length: rows * cols }), []);

  // Track window size for responsive calculations
  const [windowWidth, setWindowWidth] = useState(0);
  const [boardRef, setBoardRef] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize figures array
  const [figures, setFigures] = useState<Figure[]>(() => {
    const initialFigures: Figure[] = [];
    let figureId = 0;
    
        // Create opponent figures (top two rows)
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < cols; col++) {
            initialFigures.push({
              id: `opponent-${figureId++}`,
              row,
              col,
              weapon: 0, // Initially no weapon visible
              isMyFigure: false,
              isAlive: true
            });
          }
        }
    
    // Create my figures (bottom two rows)
    for (let row = 4; row < 6; row++) {
      for (let col = 0; col < cols; col++) {
        initialFigures.push({
          id: `my-${figureId++}`,
          row,
          col,
          weapon: (1 +(row + col) % 3) as Weapon,
          isMyFigure: true,
          isAlive: true
        });
      }
    }
    
    return initialFigures;
  });

  // Calculate responsive cell dimensions for positioning
  // Use actual board dimensions if available, otherwise fallback to calculated values
  const actualBoardWidth = boardRef?.clientWidth || (windowWidth > 0 ? Math.min(840, windowWidth * 0.9) : 840);
  const actualBoardHeight = boardRef?.clientHeight || (actualBoardWidth * rows) / cols;
  const actualCellWidth = actualBoardWidth / cols;
  const actualCellHeight = actualBoardHeight / rows;
  
  // Calculate responsive figure size based on actual cell dimensions
//   console.log('actualCellWidth:', actualCellWidth, 'actualCellHeight:', actualCellHeight);
  const cellSize = Math.min(actualCellWidth, actualCellHeight);
  
  // Use a hybrid approach: minimum size for small fields, scaled size for large fields
  const figureSize = cellSize * 1.5;
  const figureScale = 1.0;
//   console.log('figureSize:', figureSize, 'figureScale:', figureScale, 'cellSize:', cellSize);

  // Animation trigger - track which figure should animate
  const [animatingFigure, setAnimatingFigure] = useState<string | null>(null);
  const [jumpDirection, setJumpDirection] = useState<'Jump Forward' | 'Jump Left' | 'Jump Right'>('Jump Forward');
  
  // Attack system
  const [attackingFigures, setAttackingFigures] = useState<string[]>([]);
  const [flippedOpponents, setFlippedOpponents] = useState<string[]>([]);
  const [attackPositions, setAttackPositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [scaledFigures, setScaledFigures] = useState<string[]>([]);
  const [attackPhase, setAttackPhase] = useState<'prepare' | 'attack' | null>(null);
  const [dyingFigures, setDyingFigures] = useState<string[]>([]);
  
  // Movement system
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [availableMoves, setAvailableMoves] = useState<{row: number, col: number, direction: string}[]>([]);

  const getAvailableMoves = (figure: Figure) => {
    const moves: {row: number, col: number, direction: string}[] = [];
    const directions = [
      { row: -1, col: 0, direction: 'up' },
      { row: 1, col: 0, direction: 'down' },
      { row: 0, col: -1, direction: 'left' },
      { row: 0, col: 1, direction: 'right' }
    ];

    directions.forEach(({ row: deltaRow, col: deltaCol, direction }) => {
      const newRow = figure.row + deltaRow;
      const newCol = figure.col + deltaCol;
      
      // Check if move is within bounds
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        // Check if target cell is empty
        const targetFigure = figures.find(f => f.row === newRow && f.col === newCol && f.isAlive);
        if (!targetFigure) {
          moves.push({ row: newRow, col: newCol, direction });
        }
      }
    });

    return moves;
  };

  const handleCellClick = (cellKey: number, figure: Figure | null) => {
    console.log('Cell clicked:', cellKey, 'figure:', figure);
    
    // If clicking on a selected figure, deselect it
    if (selectedFigure && figure && figure.id === selectedFigure.id) {
      setSelectedFigure(null);
      setAvailableMoves([]);
      return;
    }
    
    // If clicking on one of my figures, select it and show available moves
    if (figure && figure.isMyFigure) {
      const moves = getAvailableMoves(figure);
      setSelectedFigure(figure);
      setAvailableMoves(moves);
      console.log('Selected figure:', figure.id, 'Available moves:', moves);
      return;
    }
    
    // If clicking on an opponent figure and I have a selected figure, check if it's adjacent
    if (selectedFigure && figure && !figure.isMyFigure) {
      const cellRow = Math.floor(cellKey / cols);
      const cellCol = cellKey % cols;
      const isAdjacent = Math.abs(selectedFigure.row - cellRow) + Math.abs(selectedFigure.col - cellCol) === 1;
      
      if (isAdjacent) {
        console.log('Attacking opponent figure:', figure.id);
        attackFigure(selectedFigure, figure);
        setSelectedFigure(null);
        setAvailableMoves([]);
        return;
      }
    }
    
    // If clicking on an available move cell, move the figure
    if (selectedFigure && !figure) {
      const move = availableMoves.find(move => {
        const cellRow = Math.floor(cellKey / cols);
        const cellCol = cellKey % cols;
        return move.row === cellRow && move.col === cellCol;
      });
      
      if (move) {
        console.log('Moving figure to:', move);
        moveFigure(selectedFigure, move.row, move.col);
        setSelectedFigure(null);
        setAvailableMoves([]);
        return;
      }
    }
    
    // If clicking elsewhere, deselect
    setSelectedFigure(null);
    setAvailableMoves([]);
  };

  const moveFigure = (figure: Figure, newRow: number, newCol: number) => {
    // Determine jump direction based on movement
    const rowDiff = newRow - figure.row;
    const colDiff = newCol - figure.col;
    
    let jumpDirection: 'Jump Forward' | 'Jump Left' | 'Jump Right' = 'Jump Forward';
    if (colDiff < 0) {
      jumpDirection = 'Jump Left';  // Moving left
    } else if (colDiff > 0) {
      jumpDirection = 'Jump Right'; // Moving right
    }
    // For up/down movement (rowDiff !== 0), use 'Jump Forward'
    
    // Start animation on the figure (using figure ID)
    setAnimatingFigure(figure.id);
    setJumpDirection(jumpDirection);
    
    // Calculate positions
    const oldX = (figure.col * actualCellWidth) + (actualCellWidth / 2);
    const oldY = (figure.row * actualCellHeight) + (actualCellHeight / 2) - (actualCellHeight * 0.25);
    const newX = (newCol * actualCellWidth) + (actualCellWidth / 2);
    const newY = (newRow * actualCellHeight) + (actualCellHeight / 2) - (actualCellHeight * 0.25);
    
    // Mark figure as moving and set initial animation position
    setFigures(prevFigures => 
      prevFigures.map(f => 
        f.id === figure.id 
          ? { 
              ...f, 
              row: newRow, 
              col: newCol,
              isMoving: true,
              oldRow: figure.row,
              oldCol: figure.col,
              animX: oldX,
              animY: oldY
            }
          : f
      )
    );
    
    // Start position animation after 200ms delay
    setTimeout(() => {
      const startTime = Date.now();
      // Different durations based on jump direction
      const duration = (jumpDirection === 'Jump Left' || jumpDirection === 'Jump Right') ? 300 : 500;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentX = oldX + (newX - oldX) * easeProgress;
        const currentY = oldY + (newY - oldY) * easeProgress;
        
        setFigures(prevFigures => 
          prevFigures.map(f => 
            f.id === figure.id 
              ? { ...f, animX: currentX, animY: currentY }
              : f
          )
        );
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete
          setFigures(prevFigures => 
            prevFigures.map(f => 
              f.id === figure.id 
                ? { 
                    ...f, 
                    isMoving: false,
                    oldRow: undefined,
                    oldCol: undefined,
                    animX: undefined,
                    animY: undefined
                  }
                : f
            )
          );
          setAnimatingFigure(null);
        }
      };
      
      requestAnimationFrame(animate);
    }, 200); // 200ms delay before position animation starts
  };

  const attackFigure = (attacker: Figure, target: Figure) => {
    console.log('Attack initiated:', attacker.id, 'attacks', target.id);
    
    // Set opponent weapon to 1 (stone) before attack
    if (!target.isMyFigure) {
      setFigures(prevFigures => 
        prevFigures.map(f => 
          f.id === target.id 
            ? { ...f, weapon: 1 }
            : f
        )
      );
    }
    
    // Calculate attack positions (both figures move to center between them)
    const attackerX = (attacker.col * actualCellWidth) + (actualCellWidth / 2);
    const attackerY = (attacker.row * actualCellHeight) + (actualCellHeight / 2) - (actualCellHeight * 0.25);
    const targetX = (target.col * actualCellWidth) + (actualCellWidth / 2);
    const targetY = (target.row * actualCellHeight) + (actualCellHeight / 2) - (actualCellHeight * 0.25);
    
    // Calculate center position between attacker and target
    const centerX = (attackerX + targetX) / 2;
    const centerY = (attackerY + targetY) / 2;
    
    // Add some distance between figures (offset by 80px)
    const distance = 80;
    const attackerFinalX = centerX - distance;
    const targetFinalX = centerX + distance;
    
    // Set attack positions (both figures move to center with distance)
    setAttackPositions({
      [attacker.id]: { x: attackerFinalX, y: centerY },
      [target.id]: { x: targetFinalX, y: centerY }
    });
    
    // Set both figures as attacking
    setAttackingFigures([attacker.id, target.id]);
    
    // Don't scale during "Attack Prepare" phase, but keep movement animation
    
    // Instantly flip opponent (before attack prepare)
    if (!target.isMyFigure) {
      setFlippedOpponents(prev => [...prev.filter(id => id !== target.id), target.id]);
    }
    
    // Start with "Attack Prepare" phase
    setAttackPhase('prepare');
    
    // After 400ms, switch to "Attack" phase and scale figures
    setTimeout(() => {
      setAttackPhase('attack');
      setScaledFigures([attacker.id, target.id]);
      
      // After 200ms more, start death animation for opponent
      setTimeout(() => {
        if (!target.isMyFigure) {
          setDyingFigures([target.id]);
        }
      }, 200);
    }, 400);
    
    // Reset attack state and resolve combat after total animation duration
    setTimeout(() => {
      setAttackingFigures([]);
      setAttackPositions({});
      setScaledFigures([]);
      setAttackPhase(null);
      setDyingFigures([]);
      
      // Resolve combat - for now, attacker always wins (you can add RPS logic later)
      resolveCombat(attacker, target);
    }, 1400); // Total attack animation duration
  };

  const resolveCombat = (attacker: Figure, target: Figure) => {
    // For now, attacker always wins (you can add RPS logic later)
    const attackerWins = true;
    
    if (attackerWins) {
      // Attacker wins: attacker moves to target's cell, target disappears
      setFigures(prevFigures => 
        prevFigures.map(f => {
          if (f.id === attacker.id) {
            // Attacker moves to target's position
            return { ...f, row: target.row, col: target.col };
          } else if (f.id === target.id) {
            // Target disappears (set as not alive)
            return { ...f, isAlive: false };
          }
          return f;
        })
      );
    } else {
      // Target wins: target stays in place, attacker disappears
      setFigures(prevFigures => 
        prevFigures.map(f => {
          if (f.id === attacker.id) {
            // Attacker disappears
            return { ...f, isAlive: false };
          }
          return f;
        })
      );
    }
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
          ref={setBoardRef}
          style={{
            width: '100%',
            maxWidth: 'min(840px, 90vw)',
            aspectRatio: `${cols} / ${rows}`,
            background: 'transparent',
            border: '1px solid #2b3a44',
            borderRadius: 8,
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {/* Grid cells for background and click detection */}
          {cells.map((_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const availableMove = availableMoves.find(move => move.row === row && move.col === col);
            const figure = figures.find(f => f.row === row && f.col === col && f.isAlive);
            const isSelected = selectedFigure && figure && figure.id === selectedFigure.id;
            
            return (
              <div
                key={i}
                style={{
                  border: '1px solid #2b3a44',
                  background: i % 2 === 0 ? '#11171c' : '#0e1419',
                  position: 'relative',
                  cursor: figure?.isMyFigure || availableMove ? 'pointer' : 'default',
                  borderColor: isSelected ? '#66fcf1' : '#2b3a44',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
                onClick={() => handleCellClick(i, figure || null)}
              >
                {/* Show arrow for available moves */}
                {availableMove && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                      backgroundImage: `url(/arrows/${availableMove.direction}.png)`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  />
                )}
              </div>
            );
          })}
          
          {/* All figures positioned absolutely */}
          {riveStatus === 'success' && figures.filter(f => f.isAlive).map((figure) => {
            const isAnimating = animatingFigure === figure.id;
            
            // Use attack position if attacking, otherwise use animation position if moving, otherwise use normal position
            const attackPos = attackPositions[figure.id];
            const x = attackPos ? attackPos.x : (figure.isMoving && figure.animX !== undefined ? figure.animX : (figure.col * actualCellWidth) + (actualCellWidth / 2));
            const y = attackPos ? attackPos.y : (figure.isMoving && figure.animY !== undefined ? figure.animY : (figure.row * actualCellHeight) + (actualCellHeight / 2) - (actualCellHeight * 0.25));
            
            return (
              <div
                key={figure.id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: attackingFigures.includes(figure.id) ? 20 : 5,
                  transition: attackPos ? 'left 0.3s ease-in-out, top 0.3s ease-in-out' : 'none'
                }}
              >
                  <RpsFigure
                    riveFile={riveFile as any}
                    weapon={figure.weapon}
                    trigger={
                      isAnimating ? jumpDirection : 
                      attackingFigures.includes(figure.id) ? 
                        (attackPhase === 'prepare' ? 'Atttack Prepare' : 
                         dyingFigures.includes(figure.id) ? 'Death' :
                         figure.isMyFigure ? 'Attack' : undefined) : 
                      undefined
                    }
                    isMyFigure={figure.isMyFigure}
                    style={{ 
                      width: `${figureSize}px`, 
                      height: `${figureSize}px`, 
                      transform: `scale(${scaledFigures.includes(figure.id) ? figureScale * 2 : figureScale})${!figure.isMyFigure && flippedOpponents.includes(figure.id) ? ' scaleX(-1)' : ''}`, 
                      transformOrigin: 'center center',
                      transition: 'transform 0.3s ease-in-out'
                    }}
                  />
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


