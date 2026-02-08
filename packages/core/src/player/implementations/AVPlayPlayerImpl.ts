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
import { createPlayerError, PlayerErrorCode } from '../PlayerError';
import { VideoPlayerError } from '../IVideoPlayer';

/**
 * Tizen AVPlay Player implementation
 * For Samsung Smart TV (2022+)
 *
 * CRITICAL NOTES:
 * - DTS audio NOT supported on Tizen 2022
 * - AVPlay is a state machine - methods only work in specific states
 * - Memory constrained: 512MB-1GB RAM
 * - Chromium M94 (ES6 support, some ES2020+ features missing)
 */
export class AVPlayPlayerImpl implements IVideoPlayer {
  public readonly platform = 'tizen' as const;
  public readonly name = 'AVPlay';

  private avplay: any = null;
  private state: PlayerState = 'idle';
  private eventListeners: Map<PlayerEventType, Set<PlayerEventListener>> = new Map();
  private initialized = false;
  private currentTime: number = 0;
  private duration: number = 0;
  private volume: number = 1.0;
  private muted: boolean = false;

  /**
   * Initialize AVPlay
   */
  async initialize(options: PlayerInitOptions): Promise<void> {
    if (this.initialized) {
      throw new VideoPlayerError(
        'Player already initialized',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, 'Already initialized', false)
      );
    }

    try {
      // Check if Tizen AVPlay is available
      if (typeof window === 'undefined' || !(window as any).webapis?.avplay) {
        throw new VideoPlayerError(
          'AVPlay not available',
          createPlayerError(
            'unsupported_format',
            PlayerErrorCode.UNSUPPORTED_FORMAT,
            'Tizen AVPlay API is not available',
            true
          )
        );
      }

      this.avplay = (window as any).webapis.avplay;

      // Set initial volume and mute state
      this.volume = options.volume ?? 1.0;
      this.muted = options.muted ?? false;

      // Setup AVPlay listeners
      this.setupAVPlayListeners();

      this.initialized = true;
      this.setState('idle');
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to initialize AVPlay',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, String(error), true, error)
      );
    }
  }

  /**
   * Load stream with AVPlay
   */
  async load(streamUrl: string): Promise<void> {
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      try {
        this.setState('loading');

        // Close previous stream if exists
        const currentState = this.getAVPlayState();
        if (currentState !== 'NONE' && currentState !== 'IDLE') {
          this.avplay.close();
        }

        // Open new stream
        this.avplay.open(streamUrl);

        // Prepare for playback
        this.avplay.prepareAsync(
          () => {
            // Success callback
            this.setState('paused');
            this.updateDuration();
            resolve();
          },
          (error: any) => {
            // Error callback
            this.setState('error');

            // Check for DTS audio error (common on Tizen 2022)
            if (this.isDTSError(error)) {
              reject(
                new VideoPlayerError(
                  'DTS audio not supported',
                  createPlayerError(
                    'unsupported_audio',
                    PlayerErrorCode.UNSUPPORTED_AUDIO_CODEC,
                    'DTS audio codec is not supported on this TV',
                    false,
                    error
                  )
                )
              );
            } else {
              reject(
                new VideoPlayerError(
                  `Failed to load stream: ${streamUrl}`,
                  createPlayerError(
                    'network',
                    PlayerErrorCode.MANIFEST_LOAD_ERROR,
                    error.message || String(error),
                    false,
                    error
                  )
                )
              );
            }
          }
        );
      } catch (error) {
        this.setState('error');
        reject(
          new VideoPlayerError(
            'Failed to open stream',
            createPlayerError('network', PlayerErrorCode.NETWORK_ERROR, String(error), false, error)
          )
        );
      }
    });
  }

  /**
   * Start playback
   */
  async play(): Promise<void> {
    this.ensureInitialized();

    try {
      const currentState = this.getAVPlayState();

      if (currentState === 'READY' || currentState === 'PAUSED') {
        this.avplay.play();
        this.setState('playing');
        this.startTimeTracking();
      } else {
        throw new Error(`Cannot play in state: ${currentState}`);
      }
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

    try {
      const currentState = this.getAVPlayState();

      if (currentState === 'PLAYING') {
        this.avplay.pause();
        this.setState('paused');
        this.stopTimeTracking();
      }
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to pause',
        createPlayerError('media', PlayerErrorCode.MEDIA_ELEMENT_ERROR, String(error), false, error)
      );
    }
  }

  /**
   * Stop playback
   */
  async stop(): Promise<void> {
    this.ensureInitialized();

    try {
      this.stopTimeTracking();
      this.avplay.stop();
      this.avplay.close();
      this.currentTime = 0;
      this.duration = 0;
      this.setState('idle');
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to stop',
        createPlayerError('media', PlayerErrorCode.MEDIA_ELEMENT_ERROR, String(error), false, error)
      );
    }
  }

  /**
   * Seek to time (milliseconds in AVPlay!)
   */
  async seek(timeSeconds: number): Promise<void> {
    this.ensureInitialized();

    try {
      const timeMs = Math.floor(timeSeconds * 1000);
      this.avplay.seekTo(timeMs);
      this.currentTime = timeSeconds;
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to seek',
        createPlayerError('media', PlayerErrorCode.MEDIA_ELEMENT_ERROR, String(error), false, error)
      );
    }
  }

  getState(): PlayerState {
    return this.state;
  }

  getCurrentTime(): number {
    try {
      // AVPlay returns time in milliseconds
      const timeMs = this.avplay.getCurrentTime();
      this.currentTime = timeMs / 1000;
    } catch {
      // Fallback to tracked time
    }
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  getVolume(): number {
    return this.volume;
  }

  /**
   * Set volume (AVPlay uses TV system volume, we track it locally)
   */
  async setVolume(volume: number): Promise<void> {
    this.ensureInitialized();
    this.volume = Math.max(0, Math.min(1, volume));
    this.emit('volumechange', { volume: this.volume });
  }

  isMuted(): boolean {
    return this.muted;
  }

  async setMuted(muted: boolean): Promise<void> {
    this.ensureInitialized();
    this.muted = muted;
    this.emit('volumechange', { muted });
  }

  /**
   * Get available qualities (limited in AVPlay)
   */
  getAvailableQualities(): StreamQuality[] {
    // AVPlay doesn't expose quality levels directly
    // This would need to be parsed from the manifest
    return [];
  }

  getCurrentQuality(): StreamQuality | null {
    return null;
  }

  /**
   * Set quality (limited control in AVPlay)
   */
  async setQuality(_qualityId: string | null): Promise<void> {
    // AVPlay has limited manual quality control
    // Primarily uses adaptive bitrate
  }

  async enableAdaptiveBitrate(enabled: boolean): Promise<void> {
    // AVPlay always uses ABR, limited control
    if (enabled) {
      try {
        this.avplay.setStreamingProperty('ADAPTIVE_INFO', 'BITRATES=ADAPTIVE');
      } catch {
        // Ignore if not supported
      }
    }
  }

  /**
   * Get audio tracks
   */
  getAudioTracks(): AudioTrack[] {
    try {
      const tracks = this.avplay.getTotalTrackInfo();
      const audioTracks: AudioTrack[] = [];

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.type === 'AUDIO') {
          audioTracks.push({
            id: String(i),
            language: track.extra_info?.language || 'unknown',
            label: track.extra_info?.track_lang || `Audio ${i + 1}`,
            codec: '',
            channels: 2,
          });
        }
      }

      return audioTracks;
    } catch {
      return [];
    }
  }

  getCurrentAudioTrack(): AudioTrack | null {
    try {
      const currentTrack = this.avplay.getCurrentStreamInfo();
      const tracks = this.getAudioTracks();

      if (currentTrack && currentTrack.index !== undefined) {
        return tracks[currentTrack.index] ?? null;
      }
    } catch {
      // Ignore
    }
    return null;
  }

  async setAudioTrack(trackId: string): Promise<void> {
    try {
      const index = parseInt(trackId, 10);
      this.avplay.setSelectTrack('AUDIO', index);
    } catch (error) {
      // Ignore if not supported
    }
  }

  getSubtitleTracks(): SubtitleTrack[] {
    try {
      const tracks = this.avplay.getTotalTrackInfo();
      const subtitleTracks: SubtitleTrack[] = [];

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.type === 'TEXT') {
          subtitleTracks.push({
            id: String(i),
            language: track.extra_info?.language || 'unknown',
            label: track.extra_info?.track_lang || `Subtitle ${i + 1}`,
          });
        }
      }

      return subtitleTracks;
    } catch {
      return [];
    }
  }

  getCurrentSubtitleTrack(): SubtitleTrack | null {
    // AVPlay doesn't easily expose current subtitle track
    return null;
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    try {
      if (trackId === null) {
        this.avplay.setSelectTrack('TEXT', -1);
      } else {
        const index = parseInt(trackId, 10);
        this.avplay.setSelectTrack('TEXT', index);
      }
    } catch {
      // Ignore if not supported
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): PlayerMetrics {
    return {
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      bufferedTime: this.getCurrentTime(),
      droppedFrames: 0,
      totalFrames: 0,
      estimatedBandwidth: 0,
      loadTime: 0,
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
    const url = streamUrl.toLowerCase();
    return url.includes('.m3u8') || url.endsWith('.mp4');
  }

  async destroy(): Promise<void> {
    this.stopTimeTracking();

    try {
      const currentState = this.getAVPlayState();
      if (currentState !== 'NONE' && currentState !== 'IDLE') {
        this.avplay.close();
      }
    } catch {
      // Ignore errors during cleanup
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

  private getAVPlayState(): string {
    try {
      return this.avplay.getState();
    } catch {
      return 'NONE';
    }
  }

  private updateDuration(): void {
    try {
      // AVPlay returns duration in milliseconds
      const durationMs = this.avplay.getDuration();
      this.duration = durationMs / 1000;
      this.emit('durationchange', { duration: this.duration });
    } catch {
      // Ignore
    }
  }

  private timeTrackingInterval: any = null;

  private startTimeTracking(): void {
    this.stopTimeTracking();

    this.timeTrackingInterval = setInterval(() => {
      const currentTime = this.getCurrentTime();
      this.emit('timeupdate', { currentTime });
    }, 1000); // Update every second
  }

  private stopTimeTracking(): void {
    if (this.timeTrackingInterval) {
      clearInterval(this.timeTrackingInterval);
      this.timeTrackingInterval = null;
    }
  }

  private setupAVPlayListeners(): void {
    // Event listener for stream completion
    this.avplay.setListener({
      onbufferingstart: () => {
        this.setState('buffering');
        this.emit('buffering', { buffering: true });
      },

      onbufferingprogress: (_percent: number) => {
        // Could emit buffering progress here
      },

      onbufferingcomplete: () => {
        if (this.state === 'buffering') {
          this.setState('playing');
        }
        this.emit('buffering', { buffering: false });
      },

      oncurrentplaytime: (currentTime: number) => {
        this.currentTime = currentTime / 1000; // Convert ms to seconds
      },

      onevent: (eventType: string, _eventData: any) => {
        if (eventType === 'PLAYER_MSG_STREAM_COMPLETED') {
          this.setState('ended');
          this.stopTimeTracking();
          this.emit('ended', {});
        }
      },

      onerror: (eventType: string) => {
        const error = createPlayerError(
          'media',
          PlayerErrorCode.MEDIA_DECODE_ERROR,
          `AVPlay error: ${eventType}`,
          true
        );

        this.setState('error');
        this.emit('error', error);
      },
    });
  }

  /**
   * Check if error is DTS audio related
   */
  private isDTSError(error: any): boolean {
    const errorMsg = String(error?.message || error).toLowerCase();
    return (
      errorMsg.includes('dts') ||
      errorMsg.includes('audio codec') ||
      errorMsg.includes('unsupported audio')
    );
  }
}
