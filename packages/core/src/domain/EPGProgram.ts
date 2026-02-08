/**
 * EPG (Electronic Program Guide) Program domain model
 * Represents a single TV program/show
 */
export class EPGProgram {
  constructor(
    public readonly id: string,
    public readonly channelId: string,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly description: string | null,
    public readonly category: string | null,
    public readonly posterUrl: string | null,
    public readonly rating: string | null,
    public readonly season: number | null,
    public readonly episode: number | null
  ) {
    // Validation
    if (!id || id.trim().length === 0) {
      throw new Error('EPG Program ID is required');
    }
    if (!channelId || channelId.trim().length === 0) {
      throw new Error('EPG Program channel ID is required');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('EPG Program title is required');
    }
    if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
      throw new Error('EPG Program start time must be a valid Date');
    }
    if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
      throw new Error('EPG Program end time must be a valid Date');
    }
    if (endTime <= startTime) {
      throw new Error('EPG Program end time must be after start time');
    }
  }

  /**
   * Factory method to create an EPG Program
   */
  static create(params: {
    id: string;
    channelId: string;
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    category?: string;
    posterUrl?: string;
    rating?: string;
    season?: number;
    episode?: number;
  }): EPGProgram {
    return new EPGProgram(
      params.id,
      params.channelId,
      params.title,
      params.startTime,
      params.endTime,
      params.description ?? null,
      params.category ?? null,
      params.posterUrl ?? null,
      params.rating ?? null,
      params.season ?? null,
      params.episode ?? null
    );
  }

  /**
   * Get program duration in milliseconds
   */
  get durationMs(): number {
    return this.endTime.getTime() - this.startTime.getTime();
  }

  /**
   * Get program duration in minutes
   */
  get durationMinutes(): number {
    return Math.floor(this.durationMs / 60000);
  }

  /**
   * Check if program is currently airing
   */
  isAiring(now: Date = new Date()): boolean {
    return now >= this.startTime && now < this.endTime;
  }

  /**
   * Check if program has ended
   */
  hasEnded(now: Date = new Date()): boolean {
    return now >= this.endTime;
  }

  /**
   * Check if program is upcoming
   */
  isUpcoming(now: Date = new Date()): boolean {
    return now < this.startTime;
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgress(now: Date = new Date()): number {
    if (this.isUpcoming(now)) {
      return 0;
    }
    if (this.hasEnded(now)) {
      return 100;
    }

    const elapsed = now.getTime() - this.startTime.getTime();
    return Math.min(100, Math.max(0, (elapsed / this.durationMs) * 100));
  }

  /**
   * Get remaining time in milliseconds
   */
  getRemainingTime(now: Date = new Date()): number {
    if (this.hasEnded(now)) {
      return 0;
    }
    return Math.max(0, this.endTime.getTime() - now.getTime());
  }

  /**
   * Get formatted episode string (e.g., "S01E05")
   */
  get episodeString(): string | null {
    if (this.season === null || this.episode === null) {
      return null;
    }
    const s = String(this.season).padStart(2, '0');
    const e = String(this.episode).padStart(2, '0');
    return `S${s}E${e}`;
  }

  /**
   * Get formatted time range (e.g., "20:00 - 21:30")
   */
  getTimeRange(locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    const start = this.startTime.toLocaleTimeString(locale, options);
    const end = this.endTime.toLocaleTimeString(locale, options);
    return `${start} - ${end}`;
  }

  /**
   * Check if program overlaps with another program
   */
  overlaps(other: EPGProgram): boolean {
    return (
      (this.startTime < other.endTime && this.endTime > other.startTime) ||
      (other.startTime < this.endTime && other.endTime > this.startTime)
    );
  }

  /**
   * Create a copy with updated properties
   */
  with(
    updates: Partial<
      Omit<EPGProgram, 'id' | 'channelId' | 'durationMs' | 'durationMinutes' | 'episodeString'>
    >
  ): EPGProgram {
    return new EPGProgram(
      this.id,
      this.channelId,
      updates.title ?? this.title,
      updates.startTime ?? this.startTime,
      updates.endTime ?? this.endTime,
      updates.description ?? this.description,
      updates.category ?? this.category,
      updates.posterUrl ?? this.posterUrl,
      updates.rating ?? this.rating,
      updates.season ?? this.season,
      updates.episode ?? this.episode
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      channelId: this.channelId,
      title: this.title,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      description: this.description,
      category: this.category,
      posterUrl: this.posterUrl,
      rating: this.rating,
      season: this.season,
      episode: this.episode,
    };
  }

  /**
   * Create EPGProgram from plain object
   */
  static fromJSON(json: Record<string, unknown>): EPGProgram {
    return new EPGProgram(
      json.id as string,
      json.channelId as string,
      json.title as string,
      new Date(json.startTime as string),
      new Date(json.endTime as string),
      (json.description as string | null) ?? null,
      (json.category as string | null) ?? null,
      (json.posterUrl as string | null) ?? null,
      (json.rating as string | null) ?? null,
      (json.season as number | null) ?? null,
      (json.episode as number | null) ?? null
    );
  }

  /**
   * Equality check
   */
  equals(other: EPGProgram): boolean {
    return this.id === other.id && this.channelId === other.channelId;
  }

  /**
   * String representation
   */
  toString(): string {
    const episode = this.episodeString ? ` ${this.episodeString}` : '';
    return `EPGProgram(id=${this.id}, channel=${this.channelId}, title=${this.title}${episode})`;
  }
}
