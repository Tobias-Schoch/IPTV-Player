import { create } from 'zustand';
import type { PlayerState, PlayerMetrics } from '@iptv/types';
import type { IVideoPlayer } from '../player/IVideoPlayer';

/**
 * Player store state
 */
interface PlayerStoreState {
  // Player instance
  player: IVideoPlayer | null;

  // Playback state
  state: PlayerState;
  currentTime: number;
  duration: number;
  bufferedTime: number;

  // Volume
  volume: number;
  muted: boolean;

  // Current content
  currentChannelId: string | null;
  currentStreamUrl: string | null;

  // Metrics
  metrics: PlayerMetrics | null;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Quality
  selectedQualityId: string | null;
  adaptiveBitrateEnabled: boolean;

  // Actions
  setPlayer: (player: IVideoPlayer | null) => void;
  setState: (state: PlayerState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBufferedTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setCurrentChannel: (channelId: string, streamUrl: string) => void;
  setMetrics: (metrics: PlayerMetrics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setQuality: (qualityId: string | null) => void;
  setAdaptiveBitrate: (enabled: boolean) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  player: null,
  state: 'idle' as PlayerState,
  currentTime: 0,
  duration: 0,
  bufferedTime: 0,
  volume: 1.0,
  muted: false,
  currentChannelId: null,
  currentStreamUrl: null,
  metrics: null,
  isLoading: false,
  error: null,
  selectedQualityId: null,
  adaptiveBitrateEnabled: true,
};

/**
 * Player store
 */
export const usePlayerStore = create<PlayerStoreState>((set) => ({
  ...initialState,

  setPlayer: (player) => set({ player }),

  setState: (state) => set({ state }),

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  setBufferedTime: (bufferedTime) => set({ bufferedTime }),

  setVolume: (volume) => set({ volume }),

  setMuted: (muted) => set({ muted }),

  setCurrentChannel: (channelId, streamUrl) =>
    set({ currentChannelId: channelId, currentStreamUrl: streamUrl }),

  setMetrics: (metrics) => set({ metrics }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setQuality: (selectedQualityId) => set({ selectedQualityId }),

  setAdaptiveBitrate: (adaptiveBitrateEnabled) => set({ adaptiveBitrateEnabled }),

  reset: () => set(initialState),
}));

/**
 * Selectors
 */
export const selectIsPlaying = (state: PlayerStoreState): boolean =>
  state.state === 'playing';

export const selectIsBuffering = (state: PlayerStoreState): boolean =>
  state.state === 'buffering';

export const selectProgress = (state: PlayerStoreState): number =>
  state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

export const selectBufferedProgress = (state: PlayerStoreState): number =>
  state.duration > 0 ? (state.bufferedTime / state.duration) * 100 : 0;

export const selectCanPlay = (state: PlayerStoreState): boolean =>
  state.player !== null && state.state !== 'error' && !state.isLoading;

export const selectHasError = (state: PlayerStoreState): boolean =>
  state.error !== null || state.state === 'error';
