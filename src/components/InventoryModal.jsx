import React from 'react';
import { X, Shield, Sword, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { PixelCoinIcon } from './Icons';

export default function InventoryModal({
  isOpen,
  onClose,
  playerState,
  onEquipWeapon,
  onEquipArmor,
  onUsePotion,
  onBuyPotion
}) {
  if (!isOpen) return null;

  const weaponsList = [
    { id: 'dagger', name: 'Pixel Dagger', atk: 15, cost: 50, icon: '/assets/rpg/tiles/dagger_01.png' },
    { id: 'blade', name: 'Pixel Blade', atk: 25, cost: 120, icon: '/assets/rpg/tiles/short_sword_01.png' },
    { id: 'katana', name: 'Flame Katana', atk: 45, cost: 250, icon: '/assets/rpg/tiles/katana_01.png' },
    { id: 'greatsword', name: 'Dragon Greatsword', atk: 70, cost: 500, icon: '/assets/rpg/tiles/long_sword_01.png' },
  ];

  const armorsList = [
    { id: 'cloth', name: 'Cloth Tunic', def: 10, cost: 50, icon: '/assets/rpg/tiles/pouch_LVL_01.png' },
    { id: 'leather', name: 'Leather Jerkin', def: 20, cost: 150, icon: '/assets/rpg/tiles/backpack_LVL_01.png' },
    { id: 'iron', name: 'Iron Plate', def: 35, cost: 300, icon: '/assets/rpg/tiles/backpack_LVL_02.png' },
    { id: 'dragon', name: 'Dragon Scale Armor', def: 50, cost: 600, icon: '/assets/rpg/tiles/backpack_LVL_03.png' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#7D8D39] text-white p-4 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#FDE047]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                Armory & Inventory
              </h2>
              <p className="text-[11px] font-mono opacity-90">
                Equip weapons, fortify armor & drink restorative potions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-[#FEF08A] text-[#854D0E] font-mono font-bold text-xs border-2 border-[#1E2522] flex items-center gap-1.5">
              <PixelCoinIcon className="w-4 h-4" />
              <span>{playerState.gold} Gold</span>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 max-h-[70vh] overflow-y-auto flex flex-col gap-5 font-mono text-xs">
          
          {/* Quick Consumable Bar */}
          <div className="p-3 bg-[#F3F6F4] border-2 border-[#1E2522] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/assets/rpg/tiles/potion_red_01.png" alt="Health Potion" className="w-8 h-8 pixelated" />
              <div>
                <strong className="text-sm text-[#1E2522]">Health Potion (x{playerState.potions})</strong>
                <p className="text-[11px] text-gray-500">Restores +35 HP immediately</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onUsePotion}
                disabled={playerState.potions <= 0 || playerState.hp >= playerState.max_hp}
                className="neo-button text-xs py-1.5 px-3 bg-[#EF4444] text-white hover:bg-[#DC2626]"
              >
                Drink (+35 HP)
              </button>
              <button
                onClick={onBuyPotion}
                disabled={playerState.gold < 50}
                className="neo-button text-xs py-1.5 px-3 bg-[#F59E0B] text-black hover:bg-[#D97706] flex items-center gap-1"
              >
                <span>Buy</span>
                <PixelCoinIcon className="w-3.5 h-3.5" />
                <span>50</span>
              </button>
            </div>
          </div>

          {/* Weapons Section */}
          <div>
            <h3 className="font-extrabold uppercase text-xs text-[#1E2522] pb-1.5 mb-2 border-b-2 border-[#1E2522] flex items-center gap-1.5">
              <Sword className="w-4 h-4 text-[#7D8D39]" /> Weapons Arsenal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weaponsList.map(w => {
                const isEquipped = playerState.weapon_name === w.name;
                return (
                  <div 
                    key={w.id} 
                    className={`p-3 border-2 border-[#1E2522] flex items-center justify-between ${
                      isEquipped ? 'bg-[#E7EEDB]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={w.icon} alt={w.name} className="w-8 h-8 pixelated" />
                      <div>
                        <div className="font-bold text-[#1E2522]">{w.name}</div>
                        <div className="text-[11px] text-[#586526] font-bold">+{w.atk} Attack DMG</div>
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="px-2 py-0.5 bg-[#7D8D39] text-white font-bold text-[10px] border border-black">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipWeapon(w)}
                        className="neo-button text-[11px] py-1 px-2.5 bg-white text-[#1E2522] hover:bg-gray-100 flex items-center gap-1"
                      >
                        <span>Equip</span>
                        <PixelCoinIcon className="w-3 h-3" />
                        <span>{w.cost}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Armor Section */}
          <div>
            <h3 className="font-extrabold uppercase text-xs text-[#1E2522] pb-1.5 mb-2 border-b-2 border-[#1E2522] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#2563EB]" /> Armor & Defense
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {armorsList.map(a => {
                const isEquipped = playerState.armor === a.def;
                return (
                  <div 
                    key={a.id} 
                    className={`p-3 border-2 border-[#1E2522] flex items-center justify-between ${
                      isEquipped ? 'bg-[#DBEAFE]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={a.icon} alt={a.name} className="w-8 h-8 pixelated" />
                      <div>
                        <div className="font-bold text-[#1E2522]">{a.name}</div>
                        <div className="text-[11px] text-[#1E40AF] font-bold">+{a.def} Defense Rating</div>
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="px-2 py-0.5 bg-[#2563EB] text-white font-bold text-[10px] border border-black">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipArmor(a)}
                        className="neo-button text-[11px] py-1 px-2.5 bg-white text-[#1E2522] hover:bg-gray-100 flex items-center gap-1"
                      >
                        <span>Equip</span>
                        <PixelCoinIcon className="w-3 h-3" />
                        <span>{a.cost}</span>
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
            Current Stats: {playerState.hp}/{playerState.max_hp} HP • {playerState.armor} Defense
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
