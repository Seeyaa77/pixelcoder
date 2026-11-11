import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

/**
 * Pixel-friendly loading spinner with an accessible live label.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {string} label - screen-reader text
 */
export default function Spinner({ size = 'md', label = 'Loading', className = '', tone = 'olive' }) {
  const color = tone === 'light' ? 'text-white' : 'text-[#7D8D39]';

  return (
    <span role="status" aria-live="polite" className={['inline-flex items-center gap-2', className].join(' ')}>
      <Loader2 className={`${SIZES[size] || SIZES.md} animate-spin ${color}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
