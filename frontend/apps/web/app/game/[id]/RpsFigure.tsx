"use client";
import { CSSProperties, useEffect, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

export type Weapon = 0 | 1 | 2 | 3; // 0=none,1=stone,2=paper,3=scissors
export type TriggerName =
  | 'Weapon'
  | 'Jump Forward'
  | 'Jump Left'
  | 'Jump Right'
  | 'Attack Prepare'
  | 'Attack'
  | 'Trap'
  | 'Death';

export interface RpsFigureProps {
  src?: string;
  weapon?: Weapon; // when undefined, component can randomize
  trigger?: TriggerName;
  style?: CSSProperties;
  randomizeWeapon?: boolean;
}

 const MACHINE_NAMES = ['Ninja State Machine'] as const; //TODO: rename to "State Machine" once I have new figure from Valentine

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
  style
}: RpsFigureProps) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    stateMachines: MACHINE_NAMES as unknown as string[],
    onLoadError: (error) => {
      console.warn('[Rive] Load error:', error);
    }
  });

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
    try {
      for (const m of MACHINE_NAMES as unknown as string[]) {
        const inputs = (rive.stateMachineInputs?.(m) ?? []) as any[];
        const t = inputs.find((i: any) => i?.name === trigger && typeof i?.fire === 'function');
        if (t) t.fire();
      }
    } catch {}
  }, [rive, trigger]);

  return <RiveComponent style={style} />;
}
