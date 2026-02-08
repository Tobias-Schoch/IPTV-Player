'use client';

interface ErrorOverlayProps {
  error: string;
}

export function ErrorOverlay({ error }: ErrorOverlayProps): JSX.Element {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
      {/* Error Icon */}
      <div className="w-20 h-20 rounded-full bg-status-error/20 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-status-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <div className="max-w-md text-center space-y-3">
        <h3 className="text-white text-xl font-semibold">
          Playback Error
        </h3>
        <p className="text-gray-300 text-sm">
          {error}
        </p>
      </div>

      {/* Retry Button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg font-medium hover:shadow-glow transition-all"
      >
        Retry
      </button>
    </div>
  );
}
