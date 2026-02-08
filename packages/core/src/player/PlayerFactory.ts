import type { Platform } from '@iptv/types';
import type { IVideoPlayer } from './IVideoPlayer';
import { createPlayerError, PlayerErrorCode } from './PlayerError';
import { VideoPlayerError } from './IVideoPlayer';

/**
 * Player factory configuration
 */
export interface PlayerFactoryConfig {
  readonly platform: Platform;
  readonly enableDRM?: boolean;
  readonly preferredPlayer?: 'shaka' | 'hls' | 'avplay';
}

/**
 * Player factory - Creates appropriate player based on platform and stream type
 */
export class PlayerFactory {
  private static readonly HLS_EXTENSIONS = ['.m3u8', '.m3u'];
  private static readonly DASH_EXTENSIONS = ['.mpd'];
  private static readonly PROGRESSIVE_EXTENSIONS = ['.mp4', '.webm', '.ogg'];

  /**
   * Detect stream type from URL
   */
  static detectStreamType(streamUrl: string): 'hls' | 'dash' | 'progressive' | 'unknown' {
    const url = streamUrl.toLowerCase();

    // Check for HLS
    if (this.HLS_EXTENSIONS.some((ext) => url.includes(ext))) {
      return 'hls';
    }

    // Check for DASH
    if (this.DASH_EXTENSIONS.some((ext) => url.includes(ext))) {
      return 'dash';
    }

    // Check for progressive
    if (this.PROGRESSIVE_EXTENSIONS.some((ext) => url.includes(ext))) {
      return 'progressive';
    }

    // Default to HLS for IPTV streams
    return 'hls';
  }

  /**
   * Create appropriate player for the platform and stream
   */
  static async createPlayer(
    streamUrl: string,
    config: PlayerFactoryConfig
  ): Promise<IVideoPlayer> {
    const streamType = this.detectStreamType(streamUrl);

    // Platform-specific player selection
    if (config.platform === 'tizen') {
      return this.createTizenPlayer(streamUrl, config);
    } else if (config.platform === 'web') {
      return this.createWebPlayer(streamUrl, streamType, config);
    }

    throw new VideoPlayerError(
      `Unsupported platform: ${config.platform}`,
      createPlayerError(
        'unsupported_format',
        PlayerErrorCode.UNSUPPORTED_FORMAT,
        `Platform ${config.platform} is not supported`,
        true
      )
    );
  }

  /**
   * Create player for TizenOS
   */
  private static async createTizenPlayer(
    _streamUrl: string,
    _config: PlayerFactoryConfig
  ): Promise<IVideoPlayer> {
    // Dynamic import to avoid loading Tizen-specific code on web
    try {
      const { AVPlayPlayerImpl } = await import('./implementations/AVPlayPlayerImpl');
      return new AVPlayPlayerImpl();
    } catch (error) {
      throw new VideoPlayerError(
        'Failed to load Tizen player',
        createPlayerError(
          'unknown',
          PlayerErrorCode.UNKNOWN_ERROR,
          'AVPlay player implementation not available',
          true,
          error
        )
      );
    }
  }

  /**
   * Create player for Web platform
   */
  private static async createWebPlayer(
    streamUrl: string,
    streamType: string,
    config: PlayerFactoryConfig
  ): Promise<IVideoPlayer> {
    // Prefer Shaka Player for its comprehensive format support
    if (config.preferredPlayer !== 'hls' && (streamType === 'hls' || streamType === 'dash')) {
      try {
        const { ShakaPlayerImpl } = await import('./implementations/ShakaPlayerImpl');
        const player = new ShakaPlayerImpl();

        // Check if Shaka can play this stream
        if (player.canPlayStream(streamUrl)) {
          return player;
        }
      } catch (error) {
        console.warn('Shaka Player not available, falling back to HLS.js', error);
      }
    }

    // Fallback to HLS.js for HLS streams
    if (streamType === 'hls') {
      try {
        const { HLSPlayerImpl } = await import('./implementations/HLSPlayerImpl');
        return new HLSPlayerImpl();
      } catch (error) {
        throw new VideoPlayerError(
          'Failed to load HLS player',
          createPlayerError(
            'unknown',
            PlayerErrorCode.UNKNOWN_ERROR,
            'HLS.js player implementation not available',
            true,
            error
          )
        );
      }
    }

    // For progressive formats, use native HTML5 video
    if (streamType === 'progressive') {
      try {
        const { NativePlayerImpl } = await import('./implementations/NativePlayerImpl');
        return new NativePlayerImpl();
      } catch (error) {
        throw new VideoPlayerError(
          'Failed to load native player',
          createPlayerError(
            'unknown',
            PlayerErrorCode.UNKNOWN_ERROR,
            'Native HTML5 player implementation not available',
            true,
            error
          )
        );
      }
    }

    throw new VideoPlayerError(
      `Unsupported stream type: ${streamType}`,
      createPlayerError(
        'unsupported_format',
        PlayerErrorCode.UNSUPPORTED_FORMAT,
        `Stream type ${streamType} is not supported`,
        true
      )
    );
  }

  /**
   * Check if platform supports a given stream
   */
  static canPlayStream(streamUrl: string, platform: Platform): boolean {
    const streamType = this.detectStreamType(streamUrl);

    if (platform === 'tizen') {
      // Tizen AVPlay supports HLS
      return streamType === 'hls' || streamType === 'progressive';
    }

    if (platform === 'web') {
      // Web supports all formats via Shaka/HLS.js
      return true;
    }

    return false;
  }

  /**
   * Get recommended player for a stream
   */
  static getRecommendedPlayer(
    streamUrl: string,
    platform: Platform
  ): 'shaka' | 'hls' | 'avplay' | 'native' {
    const streamType = this.detectStreamType(streamUrl);

    if (platform === 'tizen') {
      return 'avplay';
    }

    if (streamType === 'dash') {
      return 'shaka';
    }

    if (streamType === 'hls') {
      return 'shaka'; // Shaka preferred for better ABR
    }

    return 'native';
  }
}
