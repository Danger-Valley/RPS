"use client";
import { CSSProperties, useEffect, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

export type Weapon = 0 | 1 | 2 | 3; // 0=none,1=stone,2=paper,3=scissors
export type TriggerName =
  | 'Weapon'
  | 'Jump Forward'
  | 'Jump Left'
  | 'Jump Right'
  | 'Atttack Prepare'
  | 'Attack'
  | 'Trap'
  | 'Death'
  | 'Paper Death'
  | 'Stone Death'
  | 'Scissors Death';

export interface RpsFigureProps {
  src?: string;
  weapon?: Weapon; // when undefined, component can randomize
  trigger?: TriggerName;
  style?: CSSProperties;
  isMyFigure?: boolean; // true for my figures, false for opponent figures
  riveFile?: any; // shared rive file instance
}

 const MACHINE_NAMES = ['State Machine Back', 'State Machine Front'] as const;

export function setWeapon(rive: any, weapon?: Weapon) {
  if (!rive) return;
  try {
    const allInputs = (MACHINE_NAMES as unknown as string[]).flatMap((m) => {
      try {
        return (rive.stateMachineInputs?.(m) ?? []) as any[];
      } catch {
        return [] as any[];
      }
    });
    for (const input of allInputs) {
      const nameRaw = String(input?.name ?? '');
      const name = nameRaw.toLowerCase();
      if ((name.includes('weapon') || name === 'weapon') && 'value' in input) {
        input.value = weapon ?? 0;
      }
    }
  } catch {}
}

export default function RpsFigure({
  src = '/figures/fig1.riv',
  weapon,
  trigger = undefined,
  style,
  isMyFigure = true,
  riveFile
}: RpsFigureProps) {
  // Choose state machine based on figure ownership
  const stateMachine = isMyFigure ? 'State Machine Back' : 'State Machine Front';
  
  const { rive, RiveComponent } = useRive({
    src: riveFile ? undefined : src,
    riveFile,
    autoplay: true,
    stateMachines: [stateMachine],
    onLoadError: (error) => {
      console.warn('[Rive] Load error:', error);
    }
  }, { useOffscreenRenderer: false });

  // Set weapon number input if present
  useEffect(() => {
    if (!rive) return;

    const c = rive?.contents;
    c?.artboards?.forEach((ab) => {
        console.log('Artboard:', ab.name);
        console.log('Animations:', ab.animations);
        console.log('State machines:', ab.stateMachines.map((sm) => sm.name));
        ab.stateMachines.forEach((sm) => {
            console.log(`Inputs for ${sm.name}:`, (rive?.stateMachineInputs?.(sm.name) ?? []).map((i) => i.name));
        });
    });

    try {
      setWeapon(rive, weapon);
    } catch {}
  }, [rive, weapon]);

  // Mount/unmount logs
  useEffect(() => {
    console.log('[Rive] component mounted');
    return () => console.log('[Rive] component unmounted');
  }, []);

  // Fire triggers by name when provided
  useEffect(() => {
    if (!rive || !trigger) return;
    console.log('[Rive] Triggering:', trigger, 'on state machine:', stateMachine);
    try {
      const inputs = (rive.stateMachineInputs?.(stateMachine) ?? []) as any[];
      console.log('[Rive] Available inputs:', inputs.map((i: any) => i.name));
      const t = inputs.find((i: any) => i?.name === trigger && typeof i?.fire === 'function');
      if (t) {
        console.log('[Rive] Firing trigger:', trigger);
        console.log('[Rive] Before firing - current state:', rive.stateMachineInputs?.(stateMachine));
        t.fire();
        console.log('[Rive] After firing - current state:', rive.stateMachineInputs?.(stateMachine));
      } else {
        console.log('[Rive] Trigger not found:', trigger);
      }
    } catch (e) {
      console.error('[Rive] Trigger error:', e);
    }
  }, [rive, trigger, stateMachine]);

  return <RiveComponent style={style} />;
}
