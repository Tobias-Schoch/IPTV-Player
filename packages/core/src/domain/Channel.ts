import type { ChannelMetadata } from '@iptv/types';

/**
 * Channel domain model - Immutable value object
 * Represents a single IPTV channel with all its metadata
 */
export class Channel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly streamUrl: string,
    public readonly logoUrl: string | null,
    public readonly groupTitle: string | null,
    public readonly metadata: ChannelMetadata
  ) {
    // Validate required fields
    if (!id || id.trim().length === 0) {
      throw new Error('Channel ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Channel name is required');
    }
    if (!streamUrl || streamUrl.trim().length === 0) {
      throw new Error('Channel stream URL is required');
    }

    // Validate URL format
    try {
      new URL(streamUrl);
    } catch {
      throw new Error(`Invalid stream URL: ${streamUrl}`);
    }
  }

  /**
   * Factory method to create a Channel from partial data
   */
  static create(params: {
    id: string;
    name: string;
    streamUrl: string;
    logoUrl?: string;
    groupTitle?: string;
    metadata?: Partial<ChannelMetadata>;
  }): Channel {
    return new Channel(
      params.id,
      params.name,
      params.streamUrl,
      params.logoUrl ?? null,
      params.groupTitle ?? null,
      {
        country: params.metadata?.country,
        language: params.metadata?.language,
        logo: params.metadata?.logo ?? params.logoUrl,
        tvgId: params.metadata?.tvgId,
        tvgName: params.metadata?.tvgName,
        groupTitle: params.metadata?.groupTitle ?? params.groupTitle,
        aspectRatio: params.metadata?.aspectRatio,
        userAgent: params.metadata?.userAgent,
        referer: params.metadata?.referer,
        httpHeaders: params.metadata?.httpHeaders,
      }
    );
  }

  /**
   * Create a copy with updated properties (immutable update)
   */
  with(updates: Partial<Omit<Channel, 'id'>>): Channel {
    return new Channel(
      this.id,
      updates.name ?? this.name,
      updates.streamUrl ?? this.streamUrl,
      updates.logoUrl ?? this.logoUrl,
      updates.groupTitle ?? this.groupTitle,
      updates.metadata ?? this.metadata
    );
  }

  /**
   * Get display name with fallback
   */
  get displayName(): string {
    return this.name || this.metadata.tvgName || 'Unknown Channel';
  }

  /**
   * Get display logo with fallback
   */
  get displayLogo(): string | null {
    return this.logoUrl || this.metadata.logo || null;
  }

  /**
   * Check if channel belongs to a specific group
   */
  inGroup(groupName: string): boolean {
    return this.groupTitle?.toLowerCase() === groupName.toLowerCase();
  }

  /**
   * Check if channel matches search query
   */
  matchesSearch(query: string): boolean {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return true;
    }

    return (
      this.name.toLowerCase().includes(searchTerm) ||
      this.metadata.tvgName?.toLowerCase().includes(searchTerm) ||
      this.groupTitle?.toLowerCase().includes(searchTerm) ||
      this.metadata.country?.toLowerCase().includes(searchTerm) ||
      this.metadata.language?.toLowerCase().includes(searchTerm) ||
      false
    );
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      streamUrl: this.streamUrl,
      logoUrl: this.logoUrl,
      groupTitle: this.groupTitle,
      metadata: this.metadata,
    };
  }

  /**
   * Create Channel from plain object (deserialization)
   */
  static fromJSON(json: Record<string, unknown>): Channel {
    return new Channel(
      json.id as string,
      json.name as string,
      json.streamUrl as string,
      (json.logoUrl as string | null) ?? null,
      (json.groupTitle as string | null) ?? null,
      (json.metadata as ChannelMetadata) ?? {}
    );
  }

  /**
   * Equality check
   */
  equals(other: Channel): boolean {
    return this.id === other.id;
  }

  /**
   * String representation
   */
  toString(): string {
    return `Channel(id=${this.id}, name=${this.name}, group=${this.groupTitle ?? 'none'})`;
  }
}
