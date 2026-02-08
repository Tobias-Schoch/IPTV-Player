/**
 * M3U/M3U8 Playlist Parser
 *
 * Parses standard IPTV M3U playlists with EXTINF metadata.
 * Supports attributes: tvg-id, tvg-name, tvg-logo, tvg-language, group-title
 */

import type { ChannelMetadata } from '@iptv/types';

export interface M3UChannelData {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl: string | null;
  groupTitle: string | null;
  metadata: ChannelMetadata;
}

export class M3UParser {
  /**
   * Parse M3U/M3U8 content from string
   */
  static parse(content: string): M3UChannelData[] {
    const lines = content.split('\n').map(line => line.trim());
    const channels: M3UChannelData[] = [];

    let currentExtinf: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines and comments (except EXTINF)
      if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
        continue;
      }

      // Parse EXTINF line
      if (line.startsWith('#EXTINF')) {
        currentExtinf = line;
        continue;
      }

      // Stream URL line (follows EXTINF)
      if (currentExtinf && !line.startsWith('#')) {
        const channel = this.parseChannel(currentExtinf, line);
        if (channel) {
          channels.push(channel);
        }
        currentExtinf = null;
      }
    }

    return channels;
  }

  /**
   * Parse a single channel from EXTINF line and stream URL
   */
  private static parseChannel(extinf: string, streamUrl: string): M3UChannelData | null {
    if (!streamUrl || streamUrl.startsWith('#')) {
      return null;
    }

    // Extract attributes from EXTINF line
    const attributes = this.parseExtinfAttributes(extinf);

    // Extract channel name (everything after the last comma)
    const nameMatch = extinf.match(/,(.*)$/);
    const name = nameMatch?.[1]?.trim() || 'Unknown Channel';

    // Generate ID from tvg-id or name
    const id = attributes['tvg-id'] || this.generateId(name);

    // Build metadata
    const metadata: ChannelMetadata = {
      tvgId: attributes['tvg-id'] || undefined,
      tvgName: attributes['tvg-name'] || undefined,
      language: attributes['tvg-language'] || undefined,
      country: attributes['tvg-country'] || undefined,
    };

    return {
      id,
      name: attributes['tvg-name'] || name,
      streamUrl: streamUrl.trim(),
      logoUrl: attributes['tvg-logo'] || null,
      groupTitle: attributes['group-title'] || null,
      metadata,
    };
  }

  /**
   * Parse attributes from EXTINF line
   * Format: #EXTINF:-1 tvg-id="..." tvg-name="..." tvg-logo="..." group-title="...", Channel Name
   */
  private static parseExtinfAttributes(extinf: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Match all key="value" pairs
    const attrRegex = /(\S+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(extinf)) !== null) {
      const key = match[1]?.toLowerCase();
      const value = match[2];
      if (key && value !== undefined) {
        attributes[key] = value;
      }
    }

    return attributes;
  }

  /**
   * Generate a unique ID from channel name
   */
  private static generateId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Fetch and parse M3U from URL
   */
  static async parseFromUrl(url: string): Promise<M3UChannelData[]> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();

      if (!content.includes('#EXTM3U')) {
        throw new Error('Invalid M3U format: missing #EXTM3U header');
      }

      return this.parse(content);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`M3U parsing failed: ${error.message}`);
      }
      throw new Error('M3U parsing failed: Unknown error');
    }
  }

  /**
   * Validate M3U format
   */
  static isValidM3U(content: string): boolean {
    return content.trim().startsWith('#EXTM3U');
  }

  /**
   * Group channels by group-title
   */
  static groupByCategory(channels: M3UChannelData[]): Map<string, M3UChannelData[]> {
    const groups = new Map<string, M3UChannelData[]>();

    for (const channel of channels) {
      const group = channel.groupTitle || 'Uncategorized';

      if (!groups.has(group)) {
        groups.set(group, []);
      }

      groups.get(group)!.push(channel);
    }

    return groups;
  }
}
