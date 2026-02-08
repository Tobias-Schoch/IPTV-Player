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
 * Shaka Player implementation for Web platform
 * Supports HLS, DASH, and DRM content
 */
export class ShakaPlayerImpl implements IVideoPlayer {
  public readonly platform = 'web' as const;
  public readonly name = 'ShakaPlayer';

  private shakaPlayer: any = null;
  private videoElement: HTMLVideoElement | null = null;
  private container: HTMLElement | null = null;
  private state: PlayerState = 'idle';
  private eventListeners: Map<PlayerEventType, Set<PlayerEventListener>> = new Map();
  private initialized = false;

  /**
   * Initialize Shaka Player
   */
  async initialize(options: PlayerInitOptions): Promise<void> {
    if (this.initialized) {
      throw new VideoPlayerError(
        'Player already initialized',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, 'Already initialized', false)
      );
    }

    try {
      // Dynamically import Shaka Player (browser only)
      const shakaModule = await import('shaka-player/dist/shaka-player.ui');
      const shaka = (shakaModule as any).default || shakaModule;

      // Check browser support
      if (!shaka.Player.isBrowserSupported()) {
        throw new VideoPlayerError(
          'Browser not supported',
          createPlayerError(
            'unsupported_format',
            PlayerErrorCode.UNSUPPORTED_FORMAT,
            'Shaka Player is not supported in this browser',
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

      // Create Shaka Player instance
      this.shakaPlayer = new shaka.Player(this.videoElement);

      // Configure Shaka Player
      this.shakaPlayer.configure({
        streaming: {
          bufferingGoal: options.maxBufferLength ?? 30,
          rebufferingGoal: 2,
          bufferBehind: 30,
        },
        abr: {
          enabled: options.adaptiveBitrate ?? true,
        },
        preferredAudioLanguage: options.preferredAudioLanguage ?? 'en',
        preferredTextLanguage: options.preferredSubtitleLanguage ?? '',
      });

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.setState('idle');
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to initialize Shaka Player',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, String(error), true, error)
      );
    }
  }

  /**
   * Load a video stream
   */
  async load(streamUrl: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.setState('loading');
      await this.shakaPlayer.load(streamUrl);
      this.setState('paused');
    } catch (error: any) {
      this.setState('error');
      throw new VideoPlayerError(
        `Failed to load stream: ${streamUrl}`,
        createPlayerError(
          'network',
          PlayerErrorCode.MANIFEST_LOAD_ERROR,
          error.message || String(error),
          false,
          error
        )
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
   * Stop playback and unload
   */
  async stop(): Promise<void> {
    this.ensureInitialized();

    if (this.shakaPlayer) {
      await this.shakaPlayer.unload();
    }

    this.setState('idle');
  }

  /**
   * Seek to specific time
   */
  async seek(timeSeconds: number): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.currentTime = timeSeconds;
  }

  /**
   * Get current state
   */
  getState(): PlayerState {
    return this.state;
  }

  /**
   * Get current time
   */
  getCurrentTime(): number {
    return this.videoElement?.currentTime ?? 0;
  }

  /**
   * Get duration
   */
  getDuration(): number {
    return this.videoElement?.duration ?? 0;
  }

  /**
   * Get volume
   */
  getVolume(): number {
    return this.videoElement?.volume ?? 0;
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.volume = Math.max(0, Math.min(1, volume));
    this.emit('volumechange', { volume: this.videoElement!.volume });
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.videoElement?.muted ?? false;
  }

  /**
   * Set muted state
   */
  async setMuted(muted: boolean): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.muted = muted;
    this.emit('volumechange', { muted });
  }

  /**
   * Get available qualities
   */
  getAvailableQualities(): StreamQuality[] {
    if (!this.shakaPlayer) {
      return [];
    }

    const tracks = this.shakaPlayer.getVariantTracks();
    return tracks.map((track: any) => ({
      id: String(track.id),
      width: track.width || 0,
      height: track.height || 0,
      bitrate: track.bandwidth,
      codec: track.videoCodec || '',
      label: `${track.height}p (${Math.round(track.bandwidth / 1000)}kbps)`,
    }));
  }

  /**
   * Get current quality
   */
  getCurrentQuality(): StreamQuality | null {
    if (!this.shakaPlayer) {
      return null;
    }

    const tracks = this.shakaPlayer.getVariantTracks();
    const activeTrack = tracks.find((t: any) => t.active);

    if (!activeTrack) {
      return null;
    }

    return {
      id: String(activeTrack.id),
      width: activeTrack.width || 0,
      height: activeTrack.height || 0,
      bitrate: activeTrack.bandwidth,
      codec: activeTrack.videoCodec || '',
      label: `${activeTrack.height}p (${Math.round(activeTrack.bandwidth / 1000)}kbps)`,
    };
  }

  /**
   * Set quality level
   */
  async setQuality(qualityId: string | null): Promise<void> {
    this.ensureInitialized();

    if (qualityId === null) {
      // Enable ABR
      this.shakaPlayer.configure({ abr: { enabled: true } });
    } else {
      // Disable ABR and select specific quality
      this.shakaPlayer.configure({ abr: { enabled: false } });
      this.shakaPlayer.selectVariantTrack(
        this.shakaPlayer.getVariantTracks().find((t: any) => String(t.id) === qualityId),
        true
      );
    }

    this.emit('qualitychange', { qualityId });
  }

  /**
   * Enable/disable adaptive bitrate
   */
  async enableAdaptiveBitrate(enabled: boolean): Promise<void> {
    this.ensureInitialized();
    this.shakaPlayer.configure({ abr: { enabled } });
  }

  /**
   * Get audio tracks
   */
  getAudioTracks(): AudioTrack[] {
    if (!this.shakaPlayer) {
      return [];
    }

    const tracks = this.shakaPlayer.getAudioLanguagesAndRoles();
    return tracks.map((track: any, index: number) => ({
      id: String(index),
      language: track.language,
      label: track.label || track.language,
      codec: '',
      channels: 2,
    }));
  }

  /**
   * Get current audio track
   */
  getCurrentAudioTrack(): AudioTrack | null {
    if (!this.shakaPlayer) {
      return null;
    }

    const currentLang = this.shakaPlayer.getConfiguration().preferredAudioLanguage;
    const tracks = this.getAudioTracks();
    return tracks.find((t) => t.language === currentLang) ?? null;
  }

  /**
   * Set audio track
   */
  async setAudioTrack(trackId: string): Promise<void> {
    this.ensureInitialized();
    const tracks = this.getAudioTracks();
    const track = tracks.find((t) => t.id === trackId);

    if (track) {
      this.shakaPlayer.selectAudioLanguage(track.language);
    }
  }

  /**
   * Get subtitle tracks
   */
  getSubtitleTracks(): SubtitleTrack[] {
    if (!this.shakaPlayer) {
      return [];
    }

    const tracks = this.shakaPlayer.getTextLanguagesAndRoles();
    return tracks.map((track: any, index: number) => ({
      id: String(index),
      language: track.language,
      label: track.label || track.language,
    }));
  }

  /**
   * Get current subtitle track
   */
  getCurrentSubtitleTrack(): SubtitleTrack | null {
    if (!this.shakaPlayer) {
      return null;
    }

    const currentLang = this.shakaPlayer.getConfiguration().preferredTextLanguage;
    const tracks = this.getSubtitleTracks();
    return tracks.find((t) => t.language === currentLang) ?? null;
  }

  /**
   * Set subtitle track
   */
  async setSubtitleTrack(trackId: string | null): Promise<void> {
    this.ensureInitialized();

    if (trackId === null) {
      this.shakaPlayer.setTextTrackVisibility(false);
    } else {
      const tracks = this.getSubtitleTracks();
      const track = tracks.find((t) => t.id === trackId);

      if (track) {
        this.shakaPlayer.selectTextLanguage(track.language);
        this.shakaPlayer.setTextTrackVisibility(true);
      }
    }
  }

  /**
   * Get playback metrics
   */
  getMetrics(): PlayerMetrics {
    const stats = this.shakaPlayer?.getStats() ?? {};
    const videoElement = this.videoElement;

    return {
      currentTime: videoElement?.currentTime ?? 0,
      duration: videoElement?.duration ?? 0,
      bufferedTime: this.getBufferedTime(),
      droppedFrames: stats.droppedFrames ?? 0,
      totalFrames: stats.decodedFrames ?? 0,
      estimatedBandwidth: stats.estimatedBandwidth ?? 0,
      loadTime: stats.loadLatency ?? 0,
    };
  }

  /**
   * Add event listener
   */
  on<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener as PlayerEventListener);
  }

  /**
   * Remove event listener
   */
  off<T = unknown>(event: PlayerEventType, listener: PlayerEventListener<T>): void {
    this.eventListeners.get(event)?.delete(listener as PlayerEventListener);
  }

  /**
   * Check if can play stream
   */
  canPlayStream(streamUrl: string): boolean {
    const url = streamUrl.toLowerCase();
    return url.includes('.m3u8') || url.includes('.mpd');
  }

  /**
   * Destroy player
   */
  async destroy(): Promise<void> {
    if (this.shakaPlayer) {
      await this.shakaPlayer.destroy();
      this.shakaPlayer = null;
    }

    if (this.videoElement && this.container) {
      this.container.removeChild(this.videoElement);
      this.videoElement = null;
    }

    this.eventListeners.clear();
    this.initialized = false;
  }

  /**
   * Check if initialized
   */
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
    if (!this.videoElement || !this.shakaPlayer) {
      return;
    }

    // Video element events
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

    // Shaka Player events
    this.shakaPlayer.addEventListener('error', (event: any) => {
      const error = createPlayerError(
        'media',
        PlayerErrorCode.MEDIA_DECODE_ERROR,
        event.detail.message,
        event.detail.severity === 2
      );
      this.setState('error');
      this.emit('error', error);
    });
  }
}
