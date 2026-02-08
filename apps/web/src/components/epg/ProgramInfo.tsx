'use client';

import { useEffect } from 'react';
import { useEPGStore } from '@iptv/core/state';
import type { EPGProgram } from '@iptv/core/domain';

interface ProgramInfoProps {
  channelId: string;
}

export function ProgramInfo({ channelId }: ProgramInfoProps): JSX.Element {
  const getCurrentProgram = useEPGStore((state) => state.getCurrentProgram);
  const getNextProgram = useEPGStore((state) => state.getNextProgram);
  const hasEPG = useEPGStore((state) => state.programs.length > 0);

  const currentProgram = getCurrentProgram(channelId);
  const nextProgram = getNextProgram(channelId);

  if (!hasEPG) {
    return <></>;
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (program: EPGProgram): string => {
    const minutes = program.durationMinutes;
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Current Program */}
      {currentProgram && (
        <div className="glass-strong p-4 rounded-lg">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-status-live/20 text-status-live text-xs font-medium rounded">
                  NOW PLAYING
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg">
                {currentProgram.title}
              </h3>
              {currentProgram.episodeString && (
                <p className="text-sm text-gray-400 mt-1">
                  {currentProgram.episodeString}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">
                {Math.round(currentProgram.getProgress())}%
              </p>
              <div className="w-16 h-2 bg-dark-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${currentProgram.getProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {currentProgram.description && (
            <p className="text-sm text-gray-300 line-clamp-2">
              {currentProgram.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {currentProgram.category && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {currentProgram.category}
              </span>
            )}
            <span>•</span>
            <span>{formatDuration(currentProgram)}</span>
            {currentProgram.rating && (
              <>
                <span>•</span>
                <span>{currentProgram.rating}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Next Program */}
      {nextProgram && (
        <div className="glass p-4 rounded-lg border border-dark-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 font-medium">UP NEXT</span>
                <span className="text-xs text-gray-400">
                  {formatTime(nextProgram.startTime)}
                </span>
              </div>
              <h4 className="text-white font-medium">
                {nextProgram.title}
              </h4>
              {nextProgram.episodeString && (
                <p className="text-xs text-gray-400 mt-1">
                  {nextProgram.episodeString}
                </p>
              )}
            </div>

            <div className="text-xs text-gray-500">
              {formatDuration(nextProgram)}
            </div>
          </div>
        </div>
      )}

      {/* No Programs */}
      {!currentProgram && !nextProgram && (
        <div className="glass p-4 rounded-lg text-center text-gray-500 text-sm">
          No program information available
        </div>
      )}
    </div>
  );
}
