'use client';

interface LoadingSpinnerProps {
  channelName: string;
}

export function LoadingSpinner({ channelName }: LoadingSpinnerProps): JSX.Element {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>

      {/* Loading Text */}
      <div className="mt-6 space-y-2 text-center">
        <p className="text-white text-lg font-medium animate-pulse">
          Loading {channelName}
        </p>
        <p className="text-gray-400 text-sm">
          Please wait...
        </p>
      </div>
    </div>
  );
}
