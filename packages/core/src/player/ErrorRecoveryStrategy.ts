import type { PlayerError, RetryConfig } from '@iptv/types';
import { getErrorRecoveryStrategy, isRecoverableError } from './PlayerError';

/**
 * Recovery action result
 */
export interface RecoveryResult {
  readonly success: boolean;
  readonly action: 'retry' | 'skip' | 'fallback' | 'fail';
  readonly message: string;
  readonly nextAttempt?: number;
}

/**
 * Error recovery state
 */
interface RetryState {
  attempts: number;
  lastAttempt: number;
  nextDelay: number;
}

/**
 * Error recovery strategy with exponential backoff
 */
export class ErrorRecoveryStrategy {
  private retryStates = new Map<string, RetryState>();

  constructor(private readonly config: RetryConfig) {}

  /**
   * Default retry configuration
   */
  static readonly DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
  };

  /**
   * Attempt to recover from an error
   */
  async recover(
    error: PlayerError,
    context: string,
    retryFn: () => Promise<void>
  ): Promise<RecoveryResult> {
    // Check if error is recoverable
    if (!isRecoverableError(error)) {
      return {
        success: false,
        action: 'fail',
        message: `Fatal error: ${error.message}`,
      };
    }

    const strategy = getErrorRecoveryStrategy(error);

    switch (strategy) {
      case 'retry':
        return this.retryWithBackoff(error, context, retryFn);

      case 'skip':
        return {
          success: true,
          action: 'skip',
          message: 'Skipping problematic content',
        };

      case 'fallback':
        return {
          success: true,
          action: 'fallback',
          message: 'Attempting fallback player',
        };

      case 'fail':
      default:
        return {
          success: false,
          action: 'fail',
          message: `Unrecoverable error: ${error.message}`,
        };
    }
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff(
    _error: PlayerError,
    context: string,
    retryFn: () => Promise<void>
  ): Promise<RecoveryResult> {
    const state = this.getOrCreateRetryState(context);

    // Check if max attempts reached
    if (state.attempts >= this.config.maxAttempts) {
      this.clearRetryState(context);
      return {
        success: false,
        action: 'fail',
        message: `Max retry attempts (${this.config.maxAttempts}) exceeded`,
      };
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      state.nextDelay,
      this.config.maxDelayMs
    );

    // Update state
    state.attempts++;
    state.lastAttempt = Date.now();
    state.nextDelay = Math.floor(delay * this.config.backoffMultiplier);

    // Wait for backoff delay
    await this.sleep(delay);

    // Attempt retry
    try {
      await retryFn();

      // Success - clear retry state
      this.clearRetryState(context);

      return {
        success: true,
        action: 'retry',
        message: `Retry successful after ${state.attempts} attempts`,
      };
    } catch (retryError) {
      // Retry failed - will try again if attempts remain
      const remainingAttempts = this.config.maxAttempts - state.attempts;

      if (remainingAttempts > 0) {
        return {
          success: false,
          action: 'retry',
          message: `Retry failed. ${remainingAttempts} attempts remaining`,
          nextAttempt: state.attempts + 1,
        };
      } else {
        this.clearRetryState(context);
        return {
          success: false,
          action: 'fail',
          message: `All retry attempts exhausted`,
        };
      }
    }
  }

  /**
   * Get or create retry state for a context
   */
  private getOrCreateRetryState(context: string): RetryState {
    let state = this.retryStates.get(context);

    if (!state) {
      state = {
        attempts: 0,
        lastAttempt: 0,
        nextDelay: this.config.initialDelayMs,
      };
      this.retryStates.set(context, state);
    }

    return state;
  }

  /**
   * Clear retry state for a context
   */
  private clearRetryState(context: string): void {
    this.retryStates.delete(context);
  }

  /**
   * Clear all retry states
   */
  clearAll(): void {
    this.retryStates.clear();
  }

  /**
   * Get number of retry attempts for a context
   */
  getAttempts(context: string): number {
    return this.retryStates.get(context)?.attempts ?? 0;
  }

  /**
   * Check if context is currently being retried
   */
  isRetrying(context: string): boolean {
    return this.retryStates.has(context);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a recovery strategy with default config
   */
  static createDefault(): ErrorRecoveryStrategy {
    return new ErrorRecoveryStrategy(this.DEFAULT_CONFIG);
  }

  /**
   * Create a recovery strategy with custom config
   */
  static create(config: Partial<RetryConfig>): ErrorRecoveryStrategy {
    return new ErrorRecoveryStrategy({
      ...this.DEFAULT_CONFIG,
      ...config,
    });
  }
}
