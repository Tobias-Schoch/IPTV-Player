import { Channel } from './Channel';

/**
 * Playlist metadata
 */
export interface PlaylistMetadata {
  readonly url?: string;
  readonly title?: string;
  readonly description?: string;
  readonly lastUpdated?: Date;
  readonly totalChannels: number;
  readonly totalGroups: number;
}

/**
 * Playlist domain model - Immutable collection of channels
 */
export class Playlist {
  private readonly channelsById: Map<string, Channel>;
  private readonly channelsByGroup: Map<string, Channel[]>;

  constructor(
    public readonly id: string,
    public readonly channels: readonly Channel[],
    public readonly metadata: PlaylistMetadata
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('Playlist ID is required');
    }

    // Build indexes for efficient lookups
    this.channelsById = new Map();
    this.channelsByGroup = new Map();

    for (const channel of channels) {
      this.channelsById.set(channel.id, channel);

      const group = channel.groupTitle ?? 'Ungrouped';
      const groupChannels = this.channelsByGroup.get(group) ?? [];
      groupChannels.push(channel);
      this.channelsByGroup.set(group, groupChannels);
    }
  }

  /**
   * Factory method to create a Playlist
   */
  static create(params: {
    id: string;
    channels: Channel[];
    metadata?: Partial<PlaylistMetadata>;
  }): Playlist {
    const groups = new Set(params.channels.map((c) => c.groupTitle ?? 'Ungrouped'));

    const metadata: PlaylistMetadata = {
      url: params.metadata?.url,
      title: params.metadata?.title,
      description: params.metadata?.description,
      lastUpdated: params.metadata?.lastUpdated ?? new Date(),
      totalChannels: params.channels.length,
      totalGroups: groups.size,
    };

    return new Playlist(params.id, params.channels, metadata);
  }

  /**
   * Get channel by ID
   */
  getChannelById(id: string): Channel | undefined {
    return this.channelsById.get(id);
  }

  /**
   * Get channels by group
   */
  getChannelsByGroup(groupName: string): readonly Channel[] {
    return this.channelsByGroup.get(groupName) ?? [];
  }

  /**
   * Get all unique group names
   */
  getGroups(): readonly string[] {
    return Array.from(this.channelsByGroup.keys()).sort();
  }

  /**
   * Search channels by query
   */
  search(query: string): readonly Channel[] {
    if (!query || query.trim().length === 0) {
      return this.channels;
    }

    return this.channels.filter((channel) => channel.matchesSearch(query));
  }

  /**
   * Filter channels by predicate
   */
  filter(predicate: (channel: Channel) => boolean): readonly Channel[] {
    return this.channels.filter(predicate);
  }

  /**
   * Get channel at index (for list navigation)
   */
  getChannelAt(index: number): Channel | undefined {
    if (index < 0 || index >= this.channels.length) {
      return undefined;
    }
    return this.channels[index];
  }

  /**
   * Get index of channel
   */
  indexOf(channel: Channel): number {
    return this.channels.findIndex((c) => c.equals(channel));
  }

  /**
   * Get next channel in list
   */
  getNextChannel(currentChannel: Channel): Channel | undefined {
    const index = this.indexOf(currentChannel);
    if (index === -1) {
      return undefined;
    }
    return this.getChannelAt(index + 1);
  }

  /**
   * Get previous channel in list
   */
  getPreviousChannel(currentChannel: Channel): Channel | undefined {
    const index = this.indexOf(currentChannel);
    if (index === -1) {
      return undefined;
    }
    return this.getChannelAt(index - 1);
  }

  /**
   * Check if playlist is empty
   */
  get isEmpty(): boolean {
    return this.channels.length === 0;
  }

  /**
   * Get total number of channels
   */
  get size(): number {
    return this.channels.length;
  }

  /**
   * Create a copy with updated channels
   */
  withChannels(channels: Channel[]): Playlist {
    return Playlist.create({
      id: this.id,
      channels,
      metadata: this.metadata,
    });
  }

  /**
   * Add a channel
   */
  addChannel(channel: Channel): Playlist {
    if (this.channelsById.has(channel.id)) {
      throw new Error(`Channel with ID ${channel.id} already exists`);
    }
    return this.withChannels([...this.channels, channel]);
  }

  /**
   * Remove a channel
   */
  removeChannel(channelId: string): Playlist {
    const filtered = this.channels.filter((c) => c.id !== channelId);
    if (filtered.length === this.channels.length) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }
    return this.withChannels(filtered);
  }

  /**
   * Update a channel
   */
  updateChannel(channelId: string, updates: Partial<Omit<Channel, 'id'>>): Playlist {
    const channel = this.getChannelById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    const updated = channel.with(updates);
    const newChannels = this.channels.map((c) => (c.id === channelId ? updated : c));
    return this.withChannels(newChannels);
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      channels: this.channels.map((c) => c.toJSON()),
      metadata: this.metadata,
    };
  }

  /**
   * Create Playlist from plain object
   */
  static fromJSON(json: Record<string, unknown>): Playlist {
    const channels = (json.channels as Array<Record<string, unknown>>).map((c) =>
      Channel.fromJSON(c)
    );

    return new Playlist(
      json.id as string,
      channels,
      json.metadata as PlaylistMetadata
    );
  }

  /**
   * String representation
   */
  toString(): string {
    return `Playlist(id=${this.id}, channels=${this.size}, groups=${this.getGroups().length})`;
  }
}
