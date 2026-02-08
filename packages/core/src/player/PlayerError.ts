import type { PlayerError, PlayerErrorType } from '@iptv/types';

/**
 * Error codes for player errors
 */
export const PlayerErrorCode = {
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NETWORK_CONNECTION_LOST: 'NETWORK_CONNECTION_LOST',
  MANIFEST_LOAD_ERROR: 'MANIFEST_LOAD_ERROR',
  SEGMENT_LOAD_ERROR: 'SEGMENT_LOAD_ERROR',

  // Media errors
  MEDIA_DECODE_ERROR: 'MEDIA_DECODE_ERROR',
  MEDIA_FORMAT_ERROR: 'MEDIA_FORMAT_ERROR',
  MEDIA_SRC_NOT_SUPPORTED: 'MEDIA_SRC_NOT_SUPPORTED',
  MEDIA_ELEMENT_ERROR: 'MEDIA_ELEMENT_ERROR',

  // DRM errors
  DRM_LICENSE_ERROR: 'DRM_LICENSE_ERROR',
  DRM_KEY_SYSTEM_ERROR: 'DRM_KEY_SYSTEM_ERROR',
  DRM_NOT_SUPPORTED: 'DRM_NOT_SUPPORTED',

  // Format errors
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  UNSUPPORTED_CODEC: 'UNSUPPORTED_CODEC',
  UNSUPPORTED_AUDIO_CODEC: 'UNSUPPORTED_AUDIO_CODEC',

  // Timeout errors
  LOAD_TIMEOUT: 'LOAD_TIMEOUT',
  PLAYBACK_TIMEOUT: 'PLAYBACK_TIMEOUT',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type PlayerErrorCodeType = (typeof PlayerErrorCode)[keyof typeof PlayerErrorCode];

/**
 * Create a player error object
 */
export function createPlayerError(
  type: PlayerErrorType,
  code: PlayerErrorCodeType,
  message: string,
  fatal: boolean = false,
  details?: unknown
): PlayerError {
  return {
    type,
    code,
    message,
    fatal,
    details,
  };
}

/**
 * Map error type to recovery strategy
 */
export function getErrorRecoveryStrategy(error: PlayerError): 'retry' | 'skip' | 'fallback' | 'fail' {
  switch (error.type) {
    case 'network':
      return error.fatal ? 'fail' : 'retry';

    case 'unsupported_audio':
      return 'skip'; // Skip channels with DTS audio on Tizen

    case 'unsupported_format':
      return 'fallback'; // Try alternative player

    case 'media':
      return error.fatal ? 'fail' : 'retry';

    case 'drm':
      return 'fail'; // Cannot recover from DRM errors

    case 'timeout':
      return 'retry';

    default:
      return 'fail';
  }
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: PlayerError): boolean {
  if (error.fatal) {
    return false;
  }

  const strategy = getErrorRecoveryStrategy(error);
  return strategy === 'retry' || strategy === 'fallback' || strategy === 'skip';
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: PlayerError): string {
  switch (error.type) {
    case 'network':
      return 'Network connection issue. Please check your internet connection.';

    case 'unsupported_audio':
      return 'This channel uses an audio format not supported by your device.';

    case 'unsupported_format':
      return 'This stream format is not supported. Trying alternative player...';

    case 'media':
      return 'Playback error occurred. Attempting to recover...';

    case 'drm':
      return 'This content requires DRM and cannot be played on your device.';

    case 'timeout':
      return 'Connection timed out. Retrying...';

    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Classify native media error
 */
export function classifyMediaError(mediaError: MediaError | null): PlayerError {
  if (!mediaError) {
    return createPlayerError(
      'unknown',
      PlayerErrorCode.UNKNOWN_ERROR,
      'Unknown media error',
      false
    );
  }

  switch (mediaError.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return createPlayerError(
        'media',
        PlayerErrorCode.MEDIA_ELEMENT_ERROR,
        'Media playback was aborted',
        false
      );

    case MediaError.MEDIA_ERR_NETWORK:
      return createPlayerError(
        'network',
        PlayerErrorCode.NETWORK_ERROR,
        'Network error while loading media',
        false
      );

    case MediaError.MEDIA_ERR_DECODE:
      return createPlayerError(
        'media',
        PlayerErrorCode.MEDIA_DECODE_ERROR,
        'Media decoding error',
        true
      );

    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return createPlayerError(
        'unsupported_format',
        PlayerErrorCode.MEDIA_SRC_NOT_SUPPORTED,
        'Media format not supported',
        true
      );

    default:
      return createPlayerError(
        'unknown',
        PlayerErrorCode.UNKNOWN_ERROR,
        mediaError.message || 'Unknown media error',
        false
      );
  }
}

/**
 * Check if error is DTS audio error (Tizen specific)
 */
export function isDTSAudioError(error: PlayerError): boolean {
  return (
    error.type === 'unsupported_audio' ||
    (error.type === 'media' &&
      error.details &&
      typeof error.details === 'object' &&
      'codec' in error.details &&
      String((error.details as { codec: string }).codec).toLowerCase().includes('dts'))
  );
}
