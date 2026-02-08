/**
 * Player abstraction layer
 * @module @iptv/core/player
 */

export type {
  IVideoPlayer,
  PlayerEventType,
  PlayerEventListener,
  PlayerInitOptions,
} from './IVideoPlayer';
export { VideoPlayerError } from './IVideoPlayer';

export { PlayerFactory } from './PlayerFactory';
export type { PlayerFactoryConfig } from './PlayerFactory';

export {
  PlayerErrorCode,
  createPlayerError,
  getErrorRecoveryStrategy,
  isRecoverableError,
  getUserFriendlyErrorMessage,
  classifyMediaError,
  isDTSAudioError,
} from './PlayerError';
export type { PlayerErrorCodeType } from './PlayerError';

export { ErrorRecoveryStrategy } from './ErrorRecoveryStrategy';
export type { RecoveryResult } from './ErrorRecoveryStrategy';
