'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayerFactory } from '@iptv/core/player';
import { usePlayerStore } from '@iptv/core/state';
import type { IVideoPlayer } from '@iptv/core/player';
import { PlayerControls } from './PlayerControls';
import { ErrorOverlay } from './ErrorOverlay';
import { LoadingSpinner } from './LoadingSpinner';

interface VideoPlayerProps {
  streamUrl: string;
  channelId: string;
  channelName: string;
  autoPlay?: boolean;
}

export function VideoPlayer({
  streamUrl,
  channelId,
  channelName,
  autoPlay = false,
}: VideoPlayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<IVideoPlayer | null>(null);

  const {
    player,
    state,
    isLoading,
    error,
    setPlayer,
    setState,
    setCurrentTime,
    setDuration,
    setBufferedTime,
    setCurrentChannel,
    setLoading,
    setError,
  } = usePlayerStore();

  const [initialized, setInitialized] = useState(false);

  // Initialize player
  useEffect(() => {
    let mounted = true;

    async function initPlayer(): Promise<void> {
      if (!containerRef.current || initialized) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create player using factory
        const newPlayer = await PlayerFactory.createPlayer(streamUrl, {
          platform: 'web',
        });

        if (!mounted) {
          await newPlayer.destroy();
          return;
        }

        // Initialize player
        await newPlayer.initialize({
          container: containerRef.current,
          autoPlay,
          muted: false,
          volume: 1.0,
          adaptiveBitrate: true,
          platform: 'web',
        });

        // Setup event listeners
        newPlayer.on('statechange', (data: any) => {
          setState(data.state);
        });

        newPlayer.on('timeupdate', (data: any) => {
          setCurrentTime(data.currentTime);
        });

        newPlayer.on('durationchange', (data: any) => {
          setDuration(data.duration);
        });

        newPlayer.on('error', (errorData: any) => {
          setError(errorData.message || 'Playback error occurred');
        });

        playerInstanceRef.current = newPlayer;
        setPlayer(newPlayer);
        setInitialized(true);

        // Load stream
        await newPlayer.load(streamUrl);
        setCurrentChannel(channelId, streamUrl);

        if (autoPlay) {
          await newPlayer.play();
        }

        setLoading(false);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize player');
          setLoading(false);
        }
      }
    }

    initPlayer();

    return () => {
      mounted = false;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, []);

  // Handle stream URL changes
  useEffect(() => {
    if (!player || !initialized) {
      return;
    }

    async function loadNewStream(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        await player!.stop();
        await player!.load(streamUrl);
        setCurrentChannel(channelId, streamUrl);

        if (autoPlay) {
          await player!.play();
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stream');
        setLoading(false);
      }
    }

    loadNewStream();
  }, [streamUrl, channelId]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Video Container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading Overlay */}
      {isLoading && <LoadingSpinner channelName={channelName} />}

      {/* Error Overlay */}
      {error && <ErrorOverlay error={error} />}

      {/* Player Controls */}
      {initialized && !isLoading && !error && (
        <PlayerControls channelName={channelName} />
      )}
    </div>
  );
}
