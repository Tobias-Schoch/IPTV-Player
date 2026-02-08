'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore, selectIsPlaying, selectProgress, selectBufferedProgress } from '@iptv/core/state';
import { formatTime } from '@/lib/utils';

interface PlayerControlsProps {
  channelName: string;
}

export function PlayerControls({ channelName }: PlayerControlsProps): JSX.Element {
  const {
    player,
    currentTime,
    duration,
    volume,
    muted,
    setVolume,
    setMuted,
  } = usePlayerStore();

  const isPlaying = usePlayerStore(selectIsPlaying);
  const progress = usePlayerStore(selectProgress);
  const bufferedProgress = usePlayerStore(selectBufferedProgress);

  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    if (isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setHideTimeout(timeout);
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [isPlaying, showControls]);

  const handleMouseMove = (): void => {
    setShowControls(true);
  };

  const handlePlayPause = async (): Promise<void> => {
    if (!player) return;

    if (isPlaying) {
      await player.pause();
    } else {
      await player.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!player || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    player.seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    player?.setVolume(newVolume);
  };

  const handleMuteToggle = (): void => {
    const newMuted = !muted;
    setMuted(newMuted);
    player?.setMuted(newMuted);
  };

  const handleFullscreen = (): void => {
    const container = document.querySelector('.video-player-container');
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Controls Container */}
      <div className="relative z-10 px-6 pb-6 space-y-3">
        {/* Channel Name */}
        <div className="text-white text-lg font-semibold text-shadow">
          {channelName}
        </div>

        {/* Progress Bar */}
        <div
          className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
          onClick={handleSeek}
        >
          {/* Buffered Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${bufferedProgress}%` }}
          />

          {/* Current Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
            style={{ width: `${progress}%` }}
          />

          {/* Seek Handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Time Display */}
            <div className="text-white text-sm font-medium text-shadow">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={handleMuteToggle}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted || volume === 0 ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover:w-24 transition-all duration-300 accent-accent-primary"
              />
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Fullscreen"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
