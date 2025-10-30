"use client";
import { CSSProperties, useEffect, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

export enum Weapon {
  None = 0,
  Stone = 1,
  Paper = 2,
  Scissors = 3,
  Flag = 4,
  Trap = 5,
}
export const WEAPON_NAMES = ['None', 'Stone', 'Paper', 'Scissors', 'Flag', 'Trap'];
// export type Weapon = 0 | 1 | 2 | 3; // 0=none,1=stone,2=paper,3=scissors
export type TriggerName =
  | 'Weapon'
  | 'Jump Forward'
  | 'Jump Left'
  | 'Jump Right'
  | 'Attack Prepare'
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
  isTrap?: boolean; // true if this is a trap piece
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
  riveFile,
  isTrap = false
}: RpsFigureProps) {
  // Choose state machine based on figure ownership
  // My figures use Back state machine, opponent figures use Front state machine
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

  // Debug logging for opponent pieces
  useEffect(() => {
    if (!isMyFigure) {
      console.log('[RpsFigure] Rendering opponent piece with Front state machine');
    }
  }, [isMyFigure]);

  // Auto-trigger "Trap Idle" for trap pieces (only for my figures)
  useEffect(() => {
    if (!rive || !isMyFigure) return;
    if (typeof (rive as any)?.stateMachineInputs !== 'function') return;
    
    if (isTrap) {
      // Trigger Trap Idle animation
      console.log('[Rive] Auto-triggering Trap Idle for trap piece');
      try {
        const inputs = (Array.isArray((rive as any)?.stateMachineInputs?.(stateMachine))
          ? (rive as any).stateMachineInputs(stateMachine)
          : []) as any[];
        const trapIdleTrigger = inputs.find((i: any) => i?.name === 'Trap Idle' && typeof i?.fire === 'function');
        if (trapIdleTrigger) {
          trapIdleTrigger.fire();
          console.log('[Rive] Trap Idle triggered successfully');
        }
      } catch (e) {
        console.error('[Rive] Trap Idle trigger error:', e);
      }
    } else {
      // Reset to normal idle when no longer a trap
      console.log('[Rive] Resetting from Trap Idle to normal idle');
      try {
        // Reset the state machine to go back to normal idle
        const inputs = (Array.isArray((rive as any)?.stateMachineInputs?.(stateMachine))
          ? (rive as any).stateMachineInputs(stateMachine)
          : []) as any[];
        // Find and fire the WeaponVisible input to reset
        const weaponVisibleInput = inputs.find((i: any) => i?.name === 'WeaponVisible');
        if (weaponVisibleInput && 'value' in weaponVisibleInput) {
          weaponVisibleInput.value = true; // Show weapon to exit trap state
        }
      } catch (e) {
        console.error('[Rive] Reset from Trap Idle error:', e);
      }
    }
  }, [rive, isTrap, isMyFigure, stateMachine]);

  return (
    <RiveComponent 
      style={style}
    />
  );
}
