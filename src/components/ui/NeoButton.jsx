import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-[#7D8D39] text-white hover:bg-[#8FA042]',
  secondary: 'bg-white text-[#1E2522] hover:bg-[#F3F6F4]',
  dark: 'bg-[#1E2522] text-white hover:bg-[#333E39]',
  danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
  amber: 'bg-[#F59E0B] text-[#1E2522] hover:bg-[#D97706]',
  ghost: 'bg-transparent text-[#1E2522] hover:bg-[#E7EEDB]',
};

const SIZES = {
  sm: 'min-h-11 px-2.5 py-1 text-[11px] gap-1',
  md: 'min-h-11 px-4 py-2 text-xs gap-2',
  lg: 'min-h-12 px-6 py-3 text-sm gap-2',
  icon: 'h-11 w-11 min-h-11 p-0',
};

/**
 * Neobrutalist button with a hard block shadow and tactile press.
 *
 * @param {'primary'|'secondary'|'dark'|'danger'|'amber'|'ghost'} variant
 * @param {'sm'|'md'|'lg'|'icon'} size
 * @param {boolean} loading - disables the button and swaps content for a spinner
 * @param {boolean} fullWidth
 */
export default function NeoButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-md border-3 border-[#1E2522] font-extrabold uppercase tracking-wide',
        'shadow-[3px_3px_0px_#1E2522] transition-[transform,box-shadow,background-color] duration-100 select-none',
        'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0px_#1E2522]',
        'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7D8D39]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3F6F4]',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#1E2522]',
        'disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_#1E2522]',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
