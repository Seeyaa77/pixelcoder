import React from 'react';

const TONES = {
  olive: 'bg-[#7D8D39] text-white',
  oliveSoft: 'bg-[#E7EEDB] text-[#586526]',
  amber: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E2] text-[#991B1B]',
  success: 'bg-[#DCFCE7] text-[#166534]',
  cyan: 'bg-[#CFFAFE] text-[#155E75]',
  indigo: 'bg-[#E0E7FF] text-[#3730A3]',
  neutral: 'bg-[#F3F6F4] text-[#1E2522]',
  ink: 'bg-[#1E2522] text-white',
};

const SIZES = {
  sm: 'px-1.5 py-0.5 text-[9px] gap-1',
  md: 'px-2 py-0.5 text-[10px] gap-1',
  lg: 'px-2.5 py-1 text-xs gap-1.5',
};

/**
 * High-contrast neobrutalist tag pill.
 *
 * @param {'olive'|'oliveSoft'|'amber'|'danger'|'success'|'cyan'|'indigo'|'neutral'|'ink'} tone
 * @param {'sm'|'md'|'lg'} size
 */
export default function NeoBadge({
  children,
  tone = 'neutral',
  size = 'md',
  as: Tag = 'span',
  className = '',
  ...props
}) {
  return (
    <Tag
      className={[
        'inline-flex items-center border-2 border-[#1E2522] font-mono font-bold uppercase leading-tight',
        TONES[tone] || TONES.neutral,
        SIZES[size] || SIZES.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
