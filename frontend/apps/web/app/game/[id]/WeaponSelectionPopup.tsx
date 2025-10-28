"use client";
import { Weapon } from './RpsFigure';

interface WeaponSelectionPopupProps {
  isOpen: boolean;
  onWeaponSelect: (weapon: Weapon) => void;
  onClose: () => void;
}

const WEAPON_IMAGES = {
  [Weapon.Stone]: '/rock.png',
  [Weapon.Paper]: '/paper.png',
  [Weapon.Scissors]: '/scissors.png'
};

const WEAPON_NAMES: Record<Weapon, string> = {
  [Weapon.None]: 'None',
  [Weapon.Stone]: 'Rock',
  [Weapon.Paper]: 'Paper',
  [Weapon.Scissors]: 'Scissors',
  [Weapon.Flag]: 'Flag',
  [Weapon.Trap]: 'Trap'
};

export default function WeaponSelectionPopup({ isOpen, onWeaponSelect, onClose }: WeaponSelectionPopupProps) {
  if (!isOpen) return null;

  const handleWeaponClick = (weapon: Weapon) => {
    onWeaponSelect(weapon);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: '#0e1419',
          border: '2px solid #66fcf1',
          borderRadius: 12,
          padding: 32,
          maxWidth: 500,
          width: '90%',
          textAlign: 'center'
        }}
      >
        <h2 style={{ color: '#66fcf1', marginTop: 0, marginBottom: 24 }}>
          Choose Your New Weapon
        </h2>
        <p style={{ color: '#c5c6c7', marginBottom: 32 }}>
          Both figures have the same weapon! Select a new weapon to break the tie.
        </p>
        
        <div
          style={{
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          {Object.entries(WEAPON_IMAGES).map(([weaponKey, imagePath]) => {
            const weapon = parseInt(weaponKey) as Weapon;
            return (
              <button
                key={weapon}
                onClick={() => handleWeaponClick(weapon)}
                style={{
                  background: 'transparent',
                  border: '2px solid #2b3a44',
                  borderRadius: 8,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 120
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#66fcf1';
                  e.currentTarget.style.backgroundColor = '#1a2529';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2b3a44';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePath}
                  alt={WEAPON_NAMES[weapon]}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'contain'
                  }}
                />
                <span style={{ color: '#c5c6c7', fontSize: 14, fontWeight: 'bold' }}>
                  {WEAPON_NAMES[weapon]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
