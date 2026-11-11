import React from 'react';

const TONES = {
  paper: 'bg-white text-[#1E2522]',
  muted: 'bg-[#F3F6F4] text-[#1E2522]',
  olive: 'bg-[#E7EEDB] text-[#1E2522]',
  amber: 'bg-[#FEF3C7] text-[#1E2522]',
  danger: 'bg-[#FEE2E2] text-[#1E2522]',
  ink: 'bg-[#1E2522] text-white',
};

const PADDING = {
  none: 'p-0',
  sm: 'p-2.5',
  md: 'p-3.5',
  lg: 'p-5 sm:p-6',
};

const SHADOWS = {
  sm: 'shadow-[3px_3px_0px_#1E2522]',
  md: 'shadow-[5px_5px_0px_#1E2522]',
  lg: 'shadow-[8px_8px_0px_#1E2522]',
};

/**
 * Heavy-border neobrutalist surface.
 *
 * @param {'paper'|'muted'|'olive'|'amber'|'danger'|'ink'} tone
 * @param {'none'|'sm'|'md'|'lg'} padding
 * @param {'sm'|'md'|'lg'|'none'} shadow
 * @param {React.ElementType} as
 */
export default function NeoCard({
  as: Tag = 'div',
  tone = 'paper',
  padding = 'md',
  shadow = 'md',
  border = 3,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={[
        'rounded-md border-[#1E2522]',
        border === 4 ? 'border-4' : border === 2 ? 'border-2' : 'border-3',
        TONES[tone] || TONES.paper,
        PADDING[padding] || PADDING.md,
        shadow === 'none' ? '' : SHADOWS[shadow] || SHADOWS.md,
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
