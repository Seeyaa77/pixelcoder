import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

// A counter keeps nested modals from unlocking the body scroll prematurely.
let bodyLockCount = 0;
let previousBodyOverflow = '';

function lockBodyScroll() {
  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount += 1;
}

function unlockBodyScroll() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

/**
 * Accessible neobrutalist modal.
 * - portals into document.body
 * - traps focus, restores focus on close
 * - closes on Escape and (optionally) backdrop click
 * - locks body scroll while open
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} [title]
 * @param {string} [description]
 * @param {React.ReactNode} [icon] - decorative icon rendered beside the title
 * @param {React.ReactNode} [footer] - sticky footer content
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [size]
 * @param {boolean} [closeOnBackdrop]
 * @param {boolean} [hideClose]
 */
export default function NeoModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  footer,
  children,
  size = 'md',
  closeOnBackdrop = true,
  hideClose = false,
  panelClassName = '',
  bodyClassName = '',
  headerClassName = 'bg-[#7D8D39] text-white',
  ariaLabel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    lockBodyScroll();

    const focusPanel = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector(FOCUSABLE);
      if (first instanceof HTMLElement) {
        first.focus();
      } else {
        panel.focus();
      }
    };
    const raf = requestAnimationFrame(focusPanel);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (node) => node instanceof HTMLElement && node.offsetParent !== null,
      );
      if (nodes.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      unlockBodyScroll();
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdrop = (event) => {
    if (!closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      closeRef.current?.();
    }
  };

  return createPortal(
    <div
      className="neo-modal-backdrop fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={handleBackdrop}
      data-testid="neo-modal-backdrop"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={[
          'neo-modal-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-md border-4 border-[#1E2522] bg-white shadow-[8px_8px_0px_#1E2522] outline-none sm:rounded-md',
          'max-w-full',
          SIZES[size] || SIZES.md,
          panelClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {(title || !hideClose) && (
          <div
            className={[
              'flex shrink-0 items-start justify-between gap-3 border-b-4 border-[#1E2522] p-3.5 sm:p-4',
              headerClassName,
            ].join(' ')}
          >
            <div className="flex min-w-0 items-center gap-2">
              {icon ? <span className="shrink-0">{icon}</span> : null}
              <div className="min-w-0">
                {title ? (
                  <h2 id={titleId} className="truncate font-extrabold text-base uppercase tracking-tight sm:text-lg">
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p id={descriptionId} className="font-mono text-[11px] opacity-90">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {!hideClose && (
              <button
                type="button"
                onClick={() => closeRef.current?.()}
                aria-label="Close dialog"
                className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[#1E2522] bg-white text-[#1E2522] transition-colors hover:bg-[#F3F6F4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FDE047]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className={['min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4', bodyClassName].join(' ')}>
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t-3 border-[#1E2522] bg-[#F3F6F4] p-3 font-mono text-xs">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
