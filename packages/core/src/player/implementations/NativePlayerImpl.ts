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
import { createPlayerError, PlayerErrorCode, classifyMediaError } from '../PlayerError';
import { VideoPlayerError } from '../IVideoPlayer';

// Extended HTMLVideoElement with audioTracks (experimental API)
interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  audioTracks?: {
    length: number;
    [index: number]: {
      enabled: boolean;
      language: string;
      label: string;
    };
  };
}

/**
 * Native HTML5 Video Player implementation
 * For progressive video formats (MP4, WebM, OGG)
 */
export class NativePlayerImpl implements IVideoPlayer {
  public readonly platform = 'web' as const;
  public readonly name = 'NativePlayer';

  private videoElement: HTMLVideoElement | null = null;
  private container: HTMLElement | null = null;
  private state: PlayerState = 'idle';
  private eventListeners: Map<PlayerEventType, Set<PlayerEventListener>> = new Map();
  private initialized = false;

  /**
   * Initialize native video player
   */
  async initialize(options: PlayerInitOptions): Promise<void> {
    if (this.initialized) {
      throw new VideoPlayerError(
        'Player already initialized',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, 'Already initialized', false)
      );
    }

    try {
      // Create video element
      this.videoElement = document.createElement('video');
      this.videoElement.controls = false;
      this.videoElement.autoplay = options.autoPlay ?? false;
      this.videoElement.muted = options.muted ?? false;
      this.videoElement.volume = options.volume ?? 1.0;
      this.videoElement.preload = 'metadata';
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = '100%';

      // Append to container
      this.container = options.container;
      this.container.appendChild(this.videoElement);

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.setState('idle');
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to initialize native player',
        createPlayerError('unknown', PlayerErrorCode.UNKNOWN_ERROR, String(error), true, error)
      );
    }
  }

  /**
   * Load video
   */
  async load(streamUrl: string): Promise<void> {
    this.ensureInitialized();

    try {
      this.setState('loading');
      this.videoElement!.src = streamUrl;
      await this.videoElement!.load();
      this.setState('paused');
    } catch (error) {
      this.setState('error');
      throw new VideoPlayerError(
        `Failed to load stream: ${streamUrl}`,
        createPlayerError('network', PlayerErrorCode.NETWORK_ERROR, String(error), false, error)
      );
    }
  }

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

  async pause(): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.pause();
    this.setState('paused');
  }

  async stop(): Promise<void> {
    this.ensureInitialized();
    this.videoElement!.pause();
    this.videoElement!.src = '';
    this.setState('idle');
  }

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
   * Native player has limited quality control
   */
  getAvailableQualities(): StreamQuality[] {
    return [];
  }

  getCurrentQuality(): StreamQuality | null {
    return null;
  }

  async setQuality(_qualityId: string | null): Promise<void> {
    // Not supported in native player
  }

  async enableAdaptiveBitrate(_enabled: boolean): Promise<void> {
    // Not supported in native player
  }

  /**
   * Get audio tracks
   */
  getAudioTracks(): AudioTrack[] {
    const videoEl = this.videoElement as ExtendedHTMLVideoElement;
    if (!videoEl || !videoEl.audioTracks) {
      return [];
    }

    const tracks: AudioTrack[] = [];
    for (let i = 0; i < videoEl.audioTracks.length; i++) {
      const track = videoEl.audioTracks[i];
      if (track) {
        tracks.push({
          id: String(i),
          language: track.language || 'unknown',
          label: track.label || `Track ${i + 1}`,
          codec: '',
          channels: 2,
        });
      }
    }
    return tracks;
  }

  getCurrentAudioTrack(): AudioTrack | null {
    const tracks = this.getAudioTracks();
    const videoEl = this.videoElement as ExtendedHTMLVideoElement;
    if (!videoEl?.audioTracks) {
      return tracks[0] ?? null;
    }

    for (let i = 0; i < videoEl.audioTracks.length; i++) {
      if (videoEl.audioTracks[i]?.enabled) {
        return tracks[i] ?? null;
      }
    }

    return null;
  }

  async setAudioTrack(trackId: string): Promise<void> {
    const videoEl = this.videoElement as ExtendedHTMLVideoElement;
    if (!videoEl?.audioTracks) {
      return;
    }

    const index = parseInt(trackId, 10);
    for (let i = 0; i < videoEl.audioTracks.length; i++) {
      const track = videoEl.audioTracks[i];
      if (track) {
        track.enabled = i === index;
      }
    }
  }

  /**
   * Get subtitle tracks
   */
  getSubtitleTracks(): SubtitleTrack[] {
    if (!this.videoElement || !this.videoElement.textTracks) {
      return [];
    }

    const tracks: SubtitleTrack[] = [];
    for (let i = 0; i < this.videoElement.textTracks.length; i++) {
      const track = this.videoElement.textTracks[i];
      if (track && track.kind === 'subtitles') {
        tracks.push({
          id: String(i),
          language: track.language || 'unknown',
          label: track.label || `Subtitle ${i + 1}`,
        });
      }
    }
    return tracks;
  }

  getCurrentSubtitleTrack(): SubtitleTrack | null {
    const tracks = this.getSubtitleTracks();
    if (!this.videoElement?.textTracks) {
      return null;
    }

    for (let i = 0; i < this.videoElement.textTracks.length; i++) {
      const track = this.videoElement.textTracks[i];
      if (track?.mode === 'showing') {
        return tracks.find((t) => t.id === String(i)) ?? null;
      }
    }

    return null;
  }

  async setSubtitleTrack(trackId: string | null): Promise<void> {
    if (!this.videoElement?.textTracks) {
      return;
    }

    for (let i = 0; i < this.videoElement.textTracks.length; i++) {
      const track = this.videoElement.textTracks[i];
      if (track) {
        track.mode = trackId !== null && String(i) === trackId ? 'showing' : 'hidden';
      }
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): PlayerMetrics {
    const video = this.videoElement;

    return {
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      bufferedTime: this.getBufferedTime(),
      droppedFrames: (video as any)?.webkitDroppedFrameCount ?? 0,
      totalFrames: (video as any)?.webkitDecodedFrameCount ?? 0,
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
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');
  }

  async destroy(): Promise<void> {
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

    this.videoElement.addEventListener('pause', () => {
      if (!this.videoElement!.ended) {
        this.setState('paused');
      }
    });

    this.videoElement.addEventListener('volumechange', () => {
      this.emit('volumechange', {
        volume: this.getVolume(),
        muted: this.isMuted(),
      });
    });

    this.videoElement.addEventListener('error', () => {
      const error = classifyMediaError(this.videoElement!.error);
      this.setState('error');
      this.emit('error', error);
    });
  }
}
