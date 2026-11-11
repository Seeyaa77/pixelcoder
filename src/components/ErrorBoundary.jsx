import React from 'react';

/**
 * Top-level error boundary: keeps a render crash from turning the whole SPA
 * into a white screen (which happened twice in this project's history).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the crash visible in the console for debugging / future reporting.
    console.error('[PixelCoder] render crash:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.localStorage.removeItem('pixelcoder_session_v3');
    } catch {
      /* storage may be unavailable */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6F4] p-4 font-mono text-[#1E2522]">
        <div className="w-full max-w-lg border-4 border-[#1E2522] bg-white p-6 shadow-[8px_8px_0px_#1E2522]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
            Critical hit on the UI
          </p>
          <h1 className="mb-2 text-xl font-extrabold uppercase">The arena crashed</h1>
          <p className="mb-4 text-xs leading-relaxed text-gray-600">
            A render error stopped the game before your code could run. Your saved progress is
            untouched. Reload to respawn; if it keeps happening, reset the local save.
          </p>
          <pre className="mb-4 max-h-32 overflow-auto border-2 border-[#1E2522] bg-[#F3F6F4] p-2 text-[10px] leading-snug">
            {String(error?.message || error)}
          </pre>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="border-2 border-[#1E2522] bg-[#7D8D39] px-4 py-2 text-xs font-bold uppercase text-white shadow-[3px_3px_0px_#1E2522] hover:bg-[#8fa042] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7D8D39]/50"
            >
              Reload arena
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="border-2 border-[#1E2522] bg-white px-4 py-2 text-xs font-bold uppercase text-[#1E2522] shadow-[3px_3px_0px_#1E2522] hover:bg-[#F3F6F4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7D8D39]/50"
            >
              Reset local save
            </button>
          </div>
        </div>
      </div>
    );
  }
}
