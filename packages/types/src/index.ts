/**
 * Shared TypeScript types and interfaces for IPTV Player
 * @module @iptv/types
 */

// Platform types
export type Platform = 'web' | 'tizen';

// Stream types
export type StreamType = 'hls' | 'dash' | 'progressive';
export type StreamProtocol = 'http' | 'https' | 'rtmp' | 'rtsp';

// Player state
export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'error'
  | 'ended';

// Video quality
export interface StreamQuality {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly bitrate: number;
  readonly codec: string;
  readonly label: string;
}

// Audio track
export interface AudioTrack {
  readonly id: string;
  readonly language: string;
  readonly label: string;
  readonly codec: string;
  readonly channels: number;
}

// Subtitle track
export interface SubtitleTrack {
  readonly id: string;
  readonly language: string;
  readonly label: string;
  readonly url?: string;
}

// Channel metadata
export interface ChannelMetadata {
  readonly country?: string;
  readonly language?: string;
  readonly logo?: string;
  readonly tvgId?: string;
  readonly tvgName?: string;
  readonly groupTitle?: string;
  readonly aspectRatio?: string;
  readonly userAgent?: string;
  readonly referer?: string;
  readonly httpHeaders?: Record<string, string>;
}

// EPG program
export interface EPGProgram {
  readonly id: string;
  readonly channelId: string;
  readonly title: string;
  readonly description?: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly category?: string;
  readonly posterUrl?: string;
  readonly rating?: string;
  readonly season?: number;
  readonly episode?: number;
}

// Player metrics
export interface PlayerMetrics {
  readonly currentTime: number;
  readonly duration: number;
  readonly bufferedTime: number;
  readonly droppedFrames: number;
  readonly totalFrames: number;
  readonly estimatedBandwidth: number;
  readonly loadTime: number;
}

// Player configuration
export interface PlayerConfig {
  readonly autoPlay: boolean;
  readonly muted: boolean;
  readonly volume: number;
  readonly preferredAudioLanguage?: string;
  readonly preferredSubtitleLanguage?: string;
  readonly adaptiveBitrate: boolean;
  readonly startQuality?: string;
  readonly maxBufferLength: number;
  readonly retryConfig: RetryConfig;
}

// Retry configuration
export interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
}

// Error types
export type PlayerErrorType =
  | 'network'
  | 'media'
  | 'drm'
  | 'unsupported_format'
  | 'unsupported_audio'
  | 'timeout'
  | 'unknown';

export interface PlayerError {
  readonly type: PlayerErrorType;
  readonly code: string;
  readonly message: string;
  readonly fatal: boolean;
  readonly details?: unknown;
}

// Storage types
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Logger types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
