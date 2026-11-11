import React from 'react';
import { Heart, ShieldAlert, Sword, User } from 'lucide-react';
import { PixelCoinIcon } from './Icons';
import NeoModal from './ui/NeoModal';
import NeoButton from './ui/NeoButton';
import NeoBadge from './ui/NeoBadge';
import { useToast } from './ui/toast-context';
import { ARMOR_MAX, ARMOR_STEP, armorUpgradeCost, damageAfterArmor, weaponXpBonus } from '../lib/progress';

const POTION_COST = 50;

export default function InventoryModal({
  isOpen,
  onClose,
  playerState,
  onEquipWeapon,
  onSelectCharacter,
  onUsePotion,
  onBuyPotion,
  onUpgradeArmor,
}) {
  const toast = useToast();

  const charactersList = [
    {
      id: 'soldier',
      name: 'Royal Soldier',
      title: 'Vanguard Warrior',
      icon: '/assets/characters/soldier/Soldier_Idle.png',
      desc: 'Expert in sword slashes, shield deflections, and precision arrow projectiles.',
      unlocked: true,
      cost: 0,
    },
    {
      id: 'archer',
      name: 'Forest Ranger',
      title: 'Bow Specialist',
      icon: '/assets/characters/soldier/projectiles/Arrow01(32x32).png',
      desc: 'Master of ranged projectile coding spells.',
      unlocked: playerState.total_xp >= 500,
      cost: 300,
    },
  ];

  const weaponsList = [
    {
      id: 'sword',
      name: 'Steel Sword',
      atk: 25,
      cost: 0,
      icon: '/assets/rpg/tiles/short_sword_01.png',
      desc: 'Standard royal vanguard blade with crisp slashing strikes.',
    },
    {
      id: 'bow',
      name: 'Long Bow & Arrows',
      atk: 45,
      cost: 150,
      icon: '/assets/characters/soldier/projectiles/Arrow01(32x32).png',
      desc: 'Fires high-velocity arrow projectiles at monster weakpoints.',
    },
    {
      id: 'katana',
      name: 'Flame Katana',
      atk: 65,
      cost: 350,
      icon: '/assets/rpg/tiles/katana_01.png',
      desc: 'Infused with flame enchantments for blazing critical slashes.',
    },
    {
      id: 'legendary',
      name: 'Legendary Katana',
      atk: 95,
      cost: 750,
      icon: '/assets/rpg/tiles/long_sword_01.png',
      desc: 'The pinnacle weapon of ancient code masters.',
    },
  ];

  const gold = playerState.gold ?? 0;
  const ownedWeapons = Array.isArray(playerState.ownedWeapons)
    ? playerState.ownedWeapons
    : [playerState.weapon_name || 'Pixel Blade'];
  const canAffordPotion = gold >= POTION_COST;
  const hpIsFull = playerState.hp >= playerState.max_hp;

  const armor = Math.max(0, Number(playerState.armor) || 0);
  const armorMaxed = armor >= ARMOR_MAX;
  const armorCost = armorUpgradeCost(armor);
  const damageTaken = damageAfterArmor(15, armor);

  const handleUpgradeArmor = () => {
    if (armorMaxed || gold < armorCost) return;
    // App owns the success / failure messaging so the toast is not duplicated.
    onUpgradeArmor?.();
  };

  const handleUsePotion = () => {
    if (playerState.potions <= 0) {
      toast.warning('No potions left', { description: 'Buy a potion for 50 gold in the Armory.' });
      return;
    }
    if (hpIsFull) {
      toast.info('HP is already full', { description: 'Save your potions for the next monster hit.' });
      return;
    }
    onUsePotion?.();
    toast.success('Potion used', { description: '+35 HP restored.' });
  };

  const handleBuyPotion = () => {
    if (!canAffordPotion) {
      toast.error('Not enough gold', {
        description: `A potion costs ${POTION_COST} gold — you have ${gold}. Clear a stage to earn more.`,
      });
      return;
    }
    onBuyPotion?.();
    toast.success('Potion purchased', { description: `${POTION_COST} gold spent. Added to your satchel.` });
  };

  const handleEquipWeapon = (weapon) => {
    if ((playerState.weapon_name || 'Steel Sword') === weapon.name) return;
    const isOwned = ownedWeapons.includes(weapon.name);
    if (!isOwned && weapon.cost > 0 && gold < weapon.cost) {
      toast.error('Not enough gold', {
        description: `${weapon.name} costs ${weapon.cost} gold — you have ${gold}.`,
      });
      return;
    }
    onEquipWeapon?.(weapon);
    toast.success(`${weapon.name} equipped`, {
      description: isOwned
        ? `Owned weapon equipped — attack power ${weapon.atk} DMG.`
        : `${weapon.cost} gold spent. Attack power set to ${weapon.atk} DMG.`,
    });
  };

  const handleSelectCharacter = (character) => {
    onSelectCharacter?.(character.name);
    toast.success(`${character.name} selected`, { description: character.title });
  };

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hero Barracks & Armory"
      description="Manage your character class, weapons & potions"
      icon={<User className="h-6 w-6 text-[#FDE047]" aria-hidden="true" />}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 break-words text-gray-600">
            Hero: {playerState.character_name || 'Royal Soldier'} • {playerState.hp}/{playerState.max_hp} HP •{' '}
            {gold} gold
          </span>
          <NeoButton variant="dark" size="sm" onClick={onClose}>
            Done
          </NeoButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 font-mono text-xs">
        {/* Quick potion bar */}
        <div className="flex flex-col gap-3 border-2 border-[#1E2522] bg-[#F3F6F4] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/assets/rpg/tiles/potion_red_01.png"
              alt=""
              className="pixelated h-8 w-8 shrink-0"
              onError={(event) => {
                event.currentTarget.style.visibility = 'hidden';
              }}
            />
            <div className="min-w-0">
              <strong className="text-sm text-[#1E2522]">Health Potion (x{playerState.potions})</strong>
              <p className="text-[10px] text-gray-600">Restores +35 HP immediately in battle</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NeoButton
              variant="danger"
              size="sm"
              onClick={handleUsePotion}
              disabled={playerState.potions <= 0 || hpIsFull}
              title={hpIsFull ? 'HP is already full' : 'Drink a potion'}
            >
              Drink (+35 HP)
            </NeoButton>
            <NeoButton
              variant="amber"
              size="sm"
              onClick={handleBuyPotion}
              aria-label={`Buy potion for ${POTION_COST} gold`}
              className={!canAffordPotion ? 'opacity-70' : ''}
            >
              <span>Buy</span>
              <PixelCoinIcon className="h-3 w-3" aria-hidden="true" />
              <span>{POTION_COST}</span>
            </NeoButton>
          </div>

          {!canAffordPotion ? (
            <p
              role="note"
              className="flex w-full items-center gap-1.5 border border-[#1E2522] bg-[#FEF3C7] px-2 py-1 text-[10px] font-bold text-[#92400E]"
            >
              <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
              Not enough gold: need {POTION_COST - gold} more. You have {gold}.
            </p>
          ) : null}

          {playerState.potions > 0 && hpIsFull ? (
            <p role="note" className="w-full text-[10px] font-bold text-[#586526]">
              HP is full — potions cannot be used right now.
            </p>
          ) : null}
        </div>

        {/* Armor plates — armor is real damage mitigation, not a number */}
        <section aria-labelledby="armor-heading">
          <h3
            id="armor-heading"
            className="mb-2 flex items-center gap-1.5 border-b-2 border-[#1E2522] pb-1.5 text-xs font-extrabold uppercase text-[#1E2522]"
          >
            <ShieldAlert className="h-4 w-4 text-[#7D8D39]" aria-hidden="true" /> Armor Plates
          </h3>
          <div className="flex flex-col gap-3 border-2 border-[#1E2522] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <strong className="text-sm text-[#1E2522]">
                Armor {armor} / {ARMOR_MAX}
              </strong>
              <p className="text-[10px] text-gray-600">
                Blocks {Math.min(60, armor)}% of every monster hit — 15 DMG becomes{' '}
                <span className="font-bold text-[#1E2522]">{damageTaken} DMG</span>.
              </p>
            </div>
            <NeoButton
              variant="secondary"
              size="sm"
              onClick={handleUpgradeArmor}
              disabled={armorMaxed}
              aria-label={armorMaxed ? 'Armor is at maximum' : `Upgrade armor for ${armorCost} gold`}
            >
              {armorMaxed ? (
                <span>Maxed</span>
              ) : (
                <>
                  <span>Upgrade +{ARMOR_STEP}</span>
                  <PixelCoinIcon className="h-3 w-3" aria-hidden="true" />
                  <span>{armorCost}</span>
                </>
              )}
            </NeoButton>
          </div>
          {!armorMaxed && gold < armorCost ? (
            <p
              role="note"
              className="mt-2 flex w-full items-center gap-1.5 border border-[#1E2522] bg-[#FEF3C7] px-2 py-1 text-[10px] font-bold text-[#92400E]"
            >
              <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
              Not enough gold: need {armorCost - gold} more. You have {gold}.
            </p>
          ) : null}
        </section>

        {/* Hero roster */}
        <section aria-labelledby="roster-heading">
          <h3
            id="roster-heading"
            className="mb-2 flex items-center gap-1.5 border-b-2 border-[#1E2522] pb-1.5 text-xs font-extrabold uppercase text-[#1E2522]"
          >
            <User className="h-4 w-4 text-[#7D8D39]" aria-hidden="true" /> Hero Roster
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {charactersList.map((character) => {
              const isActive = (playerState.character_name || 'Royal Soldier') === character.name;
              return (
                <div
                  key={character.id}
                  className={`flex flex-wrap items-center justify-between gap-2 border-2 border-[#1E2522] p-3 ${
                    isActive ? 'bg-[#E7EEDB]' : 'bg-white'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[#1E2522] bg-[#F3F6F4]">
                      <img
                        src={character.icon}
                        alt=""
                        className="pixelated h-9 w-9 object-cover object-left"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#1E2522]">{character.name}</div>
                      <div className="truncate text-[10px] text-gray-600">{character.title}</div>
                    </div>
                  </div>

                  {isActive ? (
                    <NeoBadge tone="olive" size="sm">
                      Active
                    </NeoBadge>
                  ) : character.unlocked ? (
                    <NeoButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSelectCharacter(character)}
                      aria-label={`Select ${character.name}`}
                    >
                      Select
                    </NeoButton>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500">🔒 Unlocks at 500 XP</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Weapons */}
        <section aria-labelledby="weapons-heading">
          <h3
            id="weapons-heading"
            className="mb-2 flex items-center gap-1.5 border-b-2 border-[#1E2522] pb-1.5 text-xs font-extrabold uppercase text-[#1E2522]"
          >
            <Sword className="h-4 w-4 text-[#7D8D39]" aria-hidden="true" /> Weapons Arsenal
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {weaponsList.map((weapon) => {
              const isEquipped = (playerState.weapon_name || 'Steel Sword') === weapon.name;
              const isOwned = ownedWeapons.includes(weapon.name);
              const unaffordable = !isOwned && weapon.cost > 0 && gold < weapon.cost;
              return (
                <div
                  key={weapon.id}
                  className={`flex flex-wrap items-center justify-between gap-2 border-2 border-[#1E2522] p-3 ${
                    isEquipped ? 'bg-[#E7EEDB]' : 'bg-white'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <img
                      src={weapon.icon}
                      alt=""
                      className="pixelated h-8 w-8 shrink-0"
                      onError={(event) => {
                        event.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#1E2522]">{weapon.name}</div>
                      <div className="text-[10px] font-bold text-[#586526]">
                        +{weapon.atk} ATK · +{weaponXpBonus(weapon.atk)} XP per clear
                      </div>
                    </div>
                  </div>

                  {isEquipped ? (
                    <NeoBadge tone="olive" size="sm">
                      Equipped
                    </NeoBadge>
                  ) : (
                    <NeoButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEquipWeapon(weapon)}
                      aria-label={`Equip ${weapon.name}${!isOwned && weapon.cost > 0 ? ` for ${weapon.cost} gold` : ''}`}
                      className={unaffordable ? 'border-dashed opacity-70' : ''}
                    >
                      <span>Equip</span>
                      {isOwned ? (
                        <span className="text-[9px] font-bold uppercase text-[#586526]">· Owned</span>
                      ) : weapon.cost > 0 ? (
                        <>
                          <PixelCoinIcon className="h-3 w-3" aria-hidden="true" />
                          <span>{weapon.cost}</span>
                        </>
                      ) : null}
                    </NeoButton>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <p className="flex items-center gap-1.5 text-[10px] text-gray-600">
          <Heart className="h-3 w-3 fill-[#DC2626] text-[#DC2626]" aria-hidden="true" />
          Potions refill +35 HP. Equip stronger weapons with gold earned from cleared stages.
        </p>
      </div>
    </NeoModal>
  );
}
