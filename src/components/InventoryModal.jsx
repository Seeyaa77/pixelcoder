import React from 'react';
import { X, Sword, Heart, Sparkles, User, Crosshair, ShieldAlert } from 'lucide-react';
import { PixelCoinIcon } from './Icons';

export default function InventoryModal({
  isOpen,
  onClose,
  playerState,
  onEquipWeapon,
  onSelectCharacter,
  onUsePotion,
  onBuyPotion
}) {
  if (!isOpen) return null;

  const charactersList = [
    { 
      id: 'soldier', 
      name: 'Royal Soldier', 
      title: 'Vanguard Warrior', 
      icon: '/assets/characters/soldier/Soldier_Idle.png',
      desc: 'Expert in sword slashes, shield deflections, and precision arrow projectiles.',
      unlocked: true,
      cost: 0 
    },
    { 
      id: 'archer', 
      name: 'Forest Ranger', 
      title: 'Bow Specialist', 
      icon: '/assets/characters/soldier/projectiles/Arrow01(32x32).png',
      desc: 'Master of ranged projectile coding spells.',
      unlocked: playerState.total_xp >= 500,
      cost: 300 
    },
  ];

  const weaponsList = [
    { 
      id: 'sword', 
      name: 'Steel Sword', 
      atk: 25, 
      cost: 0, 
      icon: '/assets/rpg/tiles/short_sword_01.png',
      desc: 'Standard royal vanguard blade with crisp slashing strikes.'
    },
    { 
      id: 'bow', 
      name: 'Long Bow & Arrows', 
      atk: 45, 
      cost: 150, 
      icon: '/assets/characters/soldier/projectiles/Arrow01(32x32).png',
      desc: 'Fires high-velocity arrow projectiles at monster weakpoints.'
    },
    { 
      id: 'katana', 
      name: 'Flame Katana', 
      atk: 65, 
      cost: 350, 
      icon: '/assets/rpg/tiles/katana_01.png',
      desc: 'Infused with flame enchantments for blazing critical slashes.'
    },
    { 
      id: 'legendary', 
      name: 'Legendary Katana', 
      atk: 95, 
      cost: 750, 
      icon: '/assets/rpg/tiles/long_sword_01.png',
      desc: 'The pinnacle weapon of ancient code masters.'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#7D8D39] text-white p-3.5 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-[#FDE047]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                Hero Barracks & Armory
              </h2>
              <p className="text-[11px] font-mono opacity-90">
                Manage your character class, weapons & potions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-[#FEF08A] text-[#854D0E] font-mono font-bold text-xs border-2 border-[#1E2522] flex items-center gap-1">
              <PixelCoinIcon className="w-3.5 h-3.5" />
              <span>{playerState.gold} Gold</span>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto flex flex-col gap-4 font-mono text-xs">
          
          {/* Quick Potion Bar */}
          <div className="p-3 bg-[#F3F6F4] border-2 border-[#1E2522] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/assets/rpg/tiles/potion_red_01.png" alt="Health Potion" className="w-7 h-7 pixelated" />
              <div>
                <strong className="text-sm text-[#1E2522]">Health Potion (x{playerState.potions})</strong>
                <p className="text-[10px] text-gray-500">Restores +35 HP immediately in battle</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onUsePotion}
                disabled={playerState.potions <= 0 || playerState.hp >= playerState.max_hp}
                className="neo-button text-xs py-1 px-3 bg-[#EF4444] text-white hover:bg-[#DC2626]"
              >
                Drink (+35 HP)
              </button>
              <button
                onClick={onBuyPotion}
                disabled={playerState.gold < 50}
                className="neo-button text-xs py-1 px-3 bg-[#F59E0B] text-black hover:bg-[#D97706] flex items-center gap-1"
              >
                <span>Buy</span>
                <PixelCoinIcon className="w-3 h-3" />
                <span>50</span>
              </button>
            </div>
          </div>

          {/* Character Classes Roster */}
          <div>
            <h3 className="font-extrabold uppercase text-xs text-[#1E2522] pb-1.5 mb-2 border-b-2 border-[#1E2522] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#7D8D39]" /> Hero Roster
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {charactersList.map(c => {
                const isActive = (playerState.character_name || 'Royal Soldier') === c.name;
                return (
                  <div 
                    key={c.id} 
                    className={`p-3 border-2 border-[#1E2522] flex items-center justify-between ${
                      isActive ? 'bg-[#E7EEDB]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-[#1E2522] bg-[#F3F6F4] flex items-center justify-center overflow-hidden">
                        <img src={c.icon} alt={c.name} className="w-8 h-8 pixelated object-cover object-left" />
                      </div>
                      <div>
                        <div className="font-bold text-[#1E2522]">{c.name}</div>
                        <div className="text-[10px] text-gray-600">{c.title}</div>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="px-2 py-0.5 bg-[#7D8D39] text-white font-bold text-[10px] border border-black">
                        ACTIVE
                      </span>
                    ) : c.unlocked ? (
                      <button
                        onClick={() => onSelectCharacter && onSelectCharacter(c.name)}
                        className="neo-button text-[10px] py-1 px-2.5 bg-white text-[#1E2522] hover:bg-gray-100"
                      >
                        Select
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold">
                        Unlocks at 500 XP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weapons Section */}
          <div>
            <h3 className="font-extrabold uppercase text-xs text-[#1E2522] pb-1.5 mb-2 border-b-2 border-[#1E2522] flex items-center gap-1.5">
              <Sword className="w-4 h-4 text-[#7D8D39]" /> Weapons Arsenal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weaponsList.map(w => {
                const isEquipped = (playerState.weapon_name || 'Steel Sword') === w.name;
                return (
                  <div 
                    key={w.id} 
                    className={`p-3 border-2 border-[#1E2522] flex items-center justify-between ${
                      isEquipped ? 'bg-[#E7EEDB]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={w.icon} alt={w.name} className="w-7 h-7 pixelated" />
                      <div>
                        <div className="font-bold text-[#1E2522]">{w.name}</div>
                        <div className="text-[10px] text-[#586526] font-bold">+{w.atk} Attack DMG</div>
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="px-2 py-0.5 bg-[#7D8D39] text-white font-bold text-[10px] border border-black">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipWeapon(w)}
                        className="neo-button text-[10px] py-1 px-2 bg-white text-[#1E2522] hover:bg-gray-100 flex items-center gap-1"
                      >
                        <span>Equip</span>
                        {w.cost > 0 && (
                          <>
                            <PixelCoinIcon className="w-3 h-3" />
                            <span>{w.cost}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#F3F6F4] p-3 border-t-3 border-[#1E2522] flex items-center justify-between font-mono text-xs">
          <span className="text-gray-600">
            Current Hero: {playerState.character_name || 'Royal Soldier'} • {playerState.hp}/{playerState.max_hp} HP
          </span>
          <button
            onClick={onClose}
            className="neo-button text-xs py-1 px-4 bg-[#1E2522] text-white hover:bg-[#333E39]"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
