import type {
  PlayerState,
  StreamQuality,
  AudioTrack,
  SubtitleTrack,
  PlayerMetrics,
  PlayerError,
  Platform,
} from '@iptv/types';

/**
 * Video player event types
 */
export type PlayerEventType =
  | 'statechange'
  | 'timeupdate'
  | 'durationchange'
  | 'volumechange'
  | 'qualitychange'
  | 'buffering'
  | 'error'
  | 'ended';

/**
 * Player event listener
 */
export type PlayerEventListener<T = unknown> = (data: T) => void;

/**
 * Player initialization options
 */
export interface PlayerInitOptions {
  readonly container: HTMLElement;
  readonly autoPlay?: boolean;
  readonly muted?: boolean;
  readonly volume?: number;
  readonly preferredAudioLanguage?: string;
  readonly preferredSubtitleLanguage?: string;
  readonly adaptiveBitrate?: boolean;
  readonly startQuality?: string;
  readonly maxBufferLength?: number;
  readonly platform: Platform;
}

/**
 * Abstract video player interface
 * All player implementations must implement this contract
 */
export interface IVideoPlayer {
  /**
   * Get the platform this player is designed for
   */
  readonly platform: Platform;

  /**
   * Get the player name/type
   */
  readonly name: string;

  /**
   * Initialize the player
   */
  initialize(options: PlayerInitOptions): Promise<void>;

  /**
   * Load a video stream
   */
  load(streamUrl: string): Promise<void>;

  /**
   * Start or resume playback
   */
  play(): Promise<void>;

  /**
   * Pause playback
   */
  pause(): Promise<void>;

  /**
   * Stop playback and release resources
   */
  stop(): Promise<void>;

  /**
   * Seek to a specific time (in seconds)
   */
  seek(timeSeconds: number): Promise<void>;

  /**
   * Get current playback state
   */
  getState(): PlayerState;

  /**
   * Get current playback time (in seconds)
   */
  getCurrentTime(): number;

  /**
   * Get total duration (in seconds)
   */
  getDuration(): number;

  /**
   * Get current volume (0-1)
   */
  getVolume(): number;

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): Promise<void>;

  /**
   * Get muted state
   */
  isMuted(): boolean;

  /**
   * Set muted state
   */
  setMuted(muted: boolean): Promise<void>;

  /**
   * Get available quality levels
   */
  getAvailableQualities(): StreamQuality[];

  /**
   * Get current quality
   */
  getCurrentQuality(): StreamQuality | null;

  /**
   * Set quality level (null for auto/adaptive)
   */
  setQuality(qualityId: string | null): Promise<void>;

  /**
   * Enable or disable adaptive bitrate streaming
   */
  enableAdaptiveBitrate(enabled: boolean): Promise<void>;

  /**
   * Get available audio tracks
   */
  getAudioTracks(): AudioTrack[];

  /**
   * Get current audio track
   */
  getCurrentAudioTrack(): AudioTrack | null;

  /**
   * Set audio track
   */
  setAudioTrack(trackId: string): Promise<void>;

  /**
   * Get available subtitle tracks
   */
  getSubtitleTracks(): SubtitleTrack[];

  /**
   * Get current subtitle track
   */
  getCurrentSubtitleTrack(): SubtitleTrack | null;

  /**
   * Set subtitle track (null to disable)
   */
  setSubtitleTrack(trackId: string | null): Promise<void>;

  /**
   * Get playback metrics
   */
  getMetrics(): PlayerMetrics;

  /**
   * Add event listener
   */
  on<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void;

  /**
   * Remove event listener
   */
  off<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void;

  /**
   * Check if player supports a given stream URL
   */
  canPlayStream(streamUrl: string): boolean;

  /**
   * Destroy the player and cleanup resources
   */
  destroy(): Promise<void>;

  /**
   * Check if player is initialized
   */
  isInitialized(): boolean;
}

/**
 * Base player error class
 */
export class VideoPlayerError extends Error {
  constructor(
    message: string,
    public readonly error: PlayerError
  ) {
    super(message);
    this.name = 'VideoPlayerError';
    Object.setPrototypeOf(this, VideoPlayerError.prototype);
  }
}
