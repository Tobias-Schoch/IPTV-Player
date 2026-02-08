import type {
  PlayerState,
  StreamQuality,
  AudioTrack,
  SubtitleTrack,
  PlayerMetrics,
} from '@iptv/types';
import type {
  IVideoPlayer,
  PlayerInitOptions,
  PlayerEventType,
  PlayerEventListener,
} from '../IVideoPlayer';
import {
  createPlayerError,
  PlayerErrorCode,
  classifyMediaError,
} from '../PlayerError';
import { VideoPlayerError } from '../IVideoPlayer';

/**
 * HLS.js Player implementation for Web platform
 * Fallback player for HLS-only streams
 */
export class HLSPlayerImpl implements IVideoPlayer {
  public readonly platform = 'web' as const;
  public readonly name = 'HLSPlayer';

  private hls: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private container: HTMLElement | null = null;
  private state: PlayerState = 'idle';
  private eventListeners: Map<PlayerEventType, Set<PlayerEventListener>> = new Map();
  private initialized = false;
  private currentStreamUrl: string | null = null;

  /**
   * Initialize HLS.js Player
   */
  async initialize(options: PlayerInitOptions): Promise<void> {
    if (this.initialized) {
      throw new VideoPlayerError(
        'Player already initialized',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, 'Already initialized', false)
      );
    }

    try {
      // Dynamically import HLS.js
      const Hls = (await import('hls.js')).default;

      // Check browser support
      if (!Hls.isSupported()) {
        // Try native HLS support (Safari)
        const video = document.createElement('video');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Use native HLS
          this.initializeNativeHLS(options);
          return;
        }

        throw new VideoPlayerError(
          'HLS not supported',
          createPlayerError(
            'unsupported_format',
            PlayerErrorCode.UNSUPPORTED_FORMAT,
            'HLS.js is not supported in this browser',
            true
          )
        );
      }

      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.controls = false;
      this.videoElement.autoplay = options.autoPlay ?? false;
      this.videoElement.muted = options.muted ?? false;
      this.videoElement.volume = options.volume ?? 1.0;
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = '100%';

      // Append to container
      this.container = options.container;
      this.container.appendChild(this.videoElement);

      // Create HLS instance
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: options.maxBufferLength ?? 30,
        maxMaxBufferLength: 60,
      });

      // Attach to video element
      this.hls.attachMedia(this.videoElement);

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.setState('idle');
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to initialize HLS.js',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, String(error), true, error)
      );
    }
  }

  /**
   * Initialize with native HLS support (Safari)
   */
  private initializeNativeHLS(options: PlayerInitOptions): void {
    this.videoElement = document.createElement('video');
    this.videoElement.controls = false;
    this.videoElement.autoplay = options.autoPlay ?? false;
    this.videoElement.muted = options.muted ?? false;
    this.videoElement.volume = options.volume ?? 1.0;
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';

    this.container = options.container;
    this.container.appendChild(this.videoElement);

    this.setupVideoElementEvents();
    this.initialized = true;
    this.setState('idle');
  }

  /**
   * Load HLS stream
   */
  async load(streamUrl: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.setState('loading');
      this.currentStreamUrl = streamUrl;

      if (this.hls) {
        // HLS.js
        this.hls.loadSource(streamUrl);
      } else if (this.videoElement) {
        // Native HLS
        this.videoElement.src = streamUrl;
      }

      this.setState('paused');
    } catch (error) {
      this.setState('error');
      throw new VideoPlayerError(
        `Failed to load stream: ${streamUrl}`,
        createPlayerError('network', PlayerErrorCode.MANIFEST_LOAD_ERROR, String(error), false, error)
      );
    }
  }

  /**
   * Start playback
   */
  async play(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.videoElement!.play();
      this.setState('playing');
    } catch (error) {
      this.setState('error');
      throw new VideoPlayerError(
        'Failed to start playback',
        createPlayerError('media', PlayerErrorCode.MEDIA_ELEMENT_ERROR, String(error), false, error)
      );
    }
  }

  /**
   * Pause playback
   */
  async pause(): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.pause();
    this.setState('paused');
  }

  /**
   * Stop playback
   */
  async stop(): Promise<void> {
    this.ensureInitialized();

    if (this.hls) {
      this.hls.stopLoad();
    }

    if (this.videoElement) {
      this.videoElement.src = '';
    }

    this.currentStreamUrl = null;
    this.setState('idle');
  }

  /**
   * Seek to time
   */
  async seek(timeSeconds: number): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.currentTime = timeSeconds;
  }

  getState(): PlayerState {
    return this.state;
  }

  getCurrentTime(): number {
    return this.videoElement?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.videoElement?.duration ?? 0;
  }

  getVolume(): number {
    return this.videoElement?.volume ?? 0;
  }

  async setVolume(volume: number): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.volume = Math.max(0, Math.min(1, volume));
    this.emit('volumechange', { volume: this.videoElement!.volume });
  }

  isMuted(): boolean {
    return this.videoElement?.muted ?? false;
  }

  async setMuted(muted: boolean): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.muted = muted;
    this.emit('volumechange', { muted });
  }

  /**
   * Get available qualities
   */
  getAvailableQualities(): StreamQuality[] {
    if (!this.hls || !this.hls.levels) {
      return [];
    }

    return this.hls.levels.map((level: any, index: number) => ({
      id: String(index),
      width: level.width || 0,
      height: level.height || 0,
      bitrate: level.bitrate,
      codec: level.videoCodec || '',
      label: `${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`,
    }));
  }

  /**
   * Get current quality
   */
  getCurrentQuality(): StreamQuality | null {
    if (!this.hls || this.hls.currentLevel < 0) {
      return null;
    }

    const level = this.hls.levels[this.hls.currentLevel];
    if (!level) {
      return null;
    }

    return {
      id: String(this.hls.currentLevel),
      width: level.width || 0,
      height: level.height || 0,
      bitrate: level.bitrate,
      codec: level.videoCodec || '',
      label: `${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`,
    };
  }

  /**
   * Set quality
   */
  async setQuality(qualityId: string | null): Promise<void> {
    this.ensureInitialized();

    if (!this.hls) {
      return;
    }

    if (qualityId === null) {
      // Enable ABR
      this.hls.currentLevel = -1;
    } else {
      // Set specific quality
      this.hls.currentLevel = parseInt(qualityId, 10);
    }

    this.emit('qualitychange', { qualityId });
  }

  async enableAdaptiveBitrate(enabled: boolean): Promise<void> {
    if (this.hls) {
      this.hls.currentLevel = enabled ? -1 : 0;
    }
  }

  /**
   * Get audio tracks
   */
  getAudioTracks(): AudioTrack[] {
    if (!this.hls || !this.hls.audioTracks) {
      return [];
    }

    return this.hls.audioTracks.map((track: any, index: number) => ({
      id: String(index),
      language: track.lang || 'unknown',
      label: track.name || track.lang || `Track ${index + 1}`,
      codec: track.codec || '',
      channels: 2,
    }));
  }

  getCurrentAudioTrack(): AudioTrack | null {
    if (!this.hls || this.hls.audioTrack < 0) {
      return null;
    }

    const tracks = this.getAudioTracks();
    return tracks[this.hls.audioTrack] ?? null;
  }

  async setAudioTrack(trackId: string): Promise<void> {
    if (this.hls) {
      this.hls.audioTrack = parseInt(trackId, 10);
    }
  }

  getSubtitleTracks(): SubtitleTrack[] {
    if (!this.hls || !this.hls.subtitleTracks) {
      return [];
    }

    return this.hls.subtitleTracks.map((track: any, index: number) => ({
      id: String(index),
      language: track.lang || 'unknown',
      label: track.name || track.lang || `Subtitle ${index + 1}`,
    }));
  }

  getCurrentSubtitleTrack(): SubtitleTrack | null {
    if (!this.hls || this.hls.subtitleTrack < 0) {
      return null;
    }

    const tracks = this.getSubtitleTracks();
    return tracks[this.hls.subtitleTrack] ?? null;
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    if (this.hls) {
      this.hls.subtitleTrack = trackId === null ? -1 : parseInt(trackId, 10);
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): PlayerMetrics {
    const stats = this.hls?.stats ?? {};

    return {
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      bufferedTime: this.getBufferedTime(),
      droppedFrames: stats.dropped ?? 0,
      totalFrames: (stats.dropped ?? 0) + (stats.total ?? 0),
      estimatedBandwidth: this.hls?.bandwidthEstimate ?? 0,
      loadTime: stats.loading?.first ?? 0,
    };
  }

  on<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as PlayerEventListener);
  }

  off<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void {
    this.eventListeners.get(event)?.delete(listener as PlayerEventListener);
  }

  canPlayStream(streamUrl: string): boolean {
    return streamUrl.toLowerCase().includes('.m3u8');
  }

  async destroy(): Promise<void> {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.videoElement && this.container) {
      this.container.removeChild(this.videoElement);
      this.videoElement = null;
    }

    this.eventListeners.clear();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Private methods

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new VideoPlayerError(
        'Player not initialized',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, 'Not initialized', false)
      );
    }
  }

  private setState(newState: PlayerState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.emit('statechange', { state: newState });
    }
  }

  private emit<T>(event: PlayerEventType, data: T): void {
    this.eventListeners.get(event)?.forEach((listener) => listener(data));
  }

  private getBufferedTime(): number {
    const video = this.videoElement;
    if (!video || !video.buffered.length) {
      return 0;
    }

    const currentTime = video.currentTime;
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.buffered.start(i) <= currentTime && currentTime <= video.buffered.end(i)) {
        return video.buffered.end(i);
      }
    }

    return 0;
  }

  private setupEventListeners(): void {
    if (!this.hls) {
      return;
    }

    this.setupVideoElementEvents();

    // HLS.js events
    const Hls = this.hls.constructor;

    this.hls.on(Hls.Events.ERROR, (_event: string, data: any) => {
      if (data.fatal) {
        this.setState('error');
        const error = createPlayerError(
          'network',
          PlayerErrorCode.NETWORK_ERROR,
          data.details || 'HLS error',
          true,
          data
        );
        this.emit('error', error);
      }
    });

    this.hls.on(Hls.Events.BUFFER_APPENDING, () => {
      this.setState('buffering');
      this.emit('buffering', { buffering: true });
    });

    this.hls.on(Hls.Events.BUFFER_APPENDED, () => {
      if (this.state === 'buffering') {
        this.setState('playing');
        this.emit('buffering', { buffering: false });
      }
    });
  }

  private setupVideoElementEvents(): void {
    if (!this.videoElement) {
      return;
    }

    this.videoElement.addEventListener('timeupdate', () => {
      this.emit('timeupdate', { currentTime: this.getCurrentTime() });
    });

    this.videoElement.addEventListener('durationchange', () => {
      this.emit('durationchange', { duration: this.getDuration() });
    });

    this.videoElement.addEventListener('ended', () => {
      this.setState('ended');
      this.emit('ended', {});
    });

    this.videoElement.addEventListener('waiting', () => {
      this.setState('buffering');
      this.emit('buffering', { buffering: true });
    });

    this.videoElement.addEventListener('playing', () => {
      this.setState('playing');
      this.emit('buffering', { buffering: false });
    });

    this.videoElement.addEventListener('error', () => {
      const error = classifyMediaError(this.videoElement!.error);
      this.setState('error');
      this.emit('error', error);
    });
  }
}
