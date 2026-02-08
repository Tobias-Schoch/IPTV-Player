import * as m3uParser from 'iptv-m3u-playlist-parser';
import { Channel, Playlist } from '../domain';
import type { ChannelMetadata } from '@iptv/types';

/**
 * Playlist format types
 */
export type PlaylistFormat = 'm3u' | 'm3u8' | 'xtream';

/**
 * Playlist source
 */
export interface PlaylistSource {
  readonly type: PlaylistFormat;
  readonly url: string;
  readonly username?: string;
  readonly password?: string;
}

/**
 * M3U Parser Result
 */
interface M3UChannel {
  name: string;
  url: string;
  tvg?: {
    id?: string;
    name?: string;
    logo?: string;
    country?: string;
    language?: string;
  };
  group?: {
    title?: string;
  };
  http?: {
    referrer?: string;
    'user-agent'?: string;
  };
}

/**
 * Playlist Parser - Supports M3U/M3U8 and Xtream Codes API
 */
export class PlaylistParser {
  /**
   * Parse playlist from URL
   */
  static async parseFromUrl(source: PlaylistSource): Promise<Playlist> {
    if (source.type === 'xtream') {
      return this.parseXtreamCodes(source);
    } else {
      return this.parseM3U(source.url);
    }
  }

  /**
   * Parse M3U/M3U8 playlist
   */
  static async parseM3U(url: string): Promise<Playlist> {
    try {
      // Fetch M3U content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist: ${response.statusText}`);
      }

      const content = await response.text();

      // Parse M3U
      const result = m3uParser.parse(content);

      if (!result || !result.items) {
        throw new Error('Invalid M3U format');
      }

      // Convert to Channel objects
      const channels: Channel[] = result.items.map((item: M3UChannel, index: number) => {
        const metadata: ChannelMetadata = {
          tvgId: item.tvg?.id,
          tvgName: item.tvg?.name,
          logo: item.tvg?.logo,
          country: item.tvg?.country,
          language: item.tvg?.language,
          groupTitle: item.group?.title,
          referer: item.http?.referrer,
          userAgent: item.http?.['user-agent'],
        };

        return Channel.create({
          id: item.tvg?.id || `channel-${index}`,
          name: item.name || `Channel ${index + 1}`,
          streamUrl: item.url,
          logoUrl: item.tvg?.logo,
          groupTitle: item.group?.title,
          metadata,
        });
      });

      // Create playlist
      return Playlist.create({
        id: this.generatePlaylistId(url),
        channels,
        metadata: {
          url,
          title: this.extractPlaylistName(url),
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to parse M3U playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse Xtream Codes API
   */
  static async parseXtreamCodes(source: PlaylistSource): Promise<Playlist> {
    if (!source.username || !source.password) {
      throw new Error('Username and password required for Xtream Codes API');
    }

    try {
      const baseUrl = source.url.replace(/\/+$/, ''); // Remove trailing slashes

      // Build API URL
      const apiUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(source.username)}&password=${encodeURIComponent(source.password)}`;

      // Get live streams
      const streamsResponse = await fetch(`${apiUrl}&action=get_live_streams`);
      if (!streamsResponse.ok) {
        throw new Error('Failed to fetch streams from Xtream Codes API');
      }

      const streams = await streamsResponse.json();

      if (!Array.isArray(streams)) {
        throw new Error('Invalid Xtream Codes API response');
      }

      // Get categories for grouping
      const categoriesResponse = await fetch(`${apiUrl}&action=get_live_categories`);
      const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
      const categoryMap = new Map(
        categories.map((cat: any) => [cat.category_id, cat.category_name])
      );

      // Convert to Channel objects
      const channels: Channel[] = streams.map((stream: any) => {
        const streamUrl = `${baseUrl}/live/${source.username}/${source.password}/${stream.stream_id}.${stream.container_extension || 'm3u8'}`;
        const groupTitle = categoryMap.get(stream.category_id) || 'Uncategorized';

        const metadata: ChannelMetadata = {
          tvgId: String(stream.stream_id),
          tvgName: stream.name,
          logo: stream.stream_icon,
          groupTitle,
        };

        return Channel.create({
          id: String(stream.stream_id),
          name: stream.name || `Channel ${stream.stream_id}`,
          streamUrl,
          logoUrl: stream.stream_icon,
          groupTitle,
          metadata,
        });
      });

      // Create playlist
      return Playlist.create({
        id: this.generatePlaylistId(`${baseUrl}-${source.username}`),
        channels,
        metadata: {
          url: baseUrl,
          title: `Xtream - ${source.username}`,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to parse Xtream Codes playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Detect playlist format from URL
   */
  static detectFormat(url: string): PlaylistFormat {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('player_api.php') || lowerUrl.includes('get.php')) {
      return 'xtream';
    }

    if (lowerUrl.endsWith('.m3u8')) {
      return 'm3u8';
    }

    if (lowerUrl.endsWith('.m3u')) {
      return 'm3u';
    }

    // Default to M3U
    return 'm3u';
  }

  /**
   * Validate playlist URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate playlist ID from URL
   */
  private static generatePlaylistId(url: string): string {
    return `playlist-${btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}`;
  }

  /**
   * Extract playlist name from URL
   */
  private static extractPlaylistName(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'playlist';
      return filename.replace(/\.(m3u8?|txt)$/i, '');
    } catch {
      return 'IPTV Playlist';
    }
  }

  /**
   * Parse playlist from text content
   */
  static parseFromText(content: string, title: string = 'Custom Playlist'): Playlist {
    try {
      const result = m3uParser.parse(content);

      if (!result || !result.items) {
        throw new Error('Invalid M3U format');
      }

      const channels: Channel[] = result.items.map((item: M3UChannel, index: number) => {
        const metadata: ChannelMetadata = {
          tvgId: item.tvg?.id,
          tvgName: item.tvg?.name,
          logo: item.tvg?.logo,
          country: item.tvg?.country,
          language: item.tvg?.language,
          groupTitle: item.group?.title,
          referer: item.http?.referrer,
          userAgent: item.http?.['user-agent'],
        };

        return Channel.create({
          id: item.tvg?.id || `channel-${index}`,
          name: item.name || `Channel ${index + 1}`,
          streamUrl: item.url,
          logoUrl: item.tvg?.logo,
          groupTitle: item.group?.title,
          metadata,
        });
      });

      return Playlist.create({
        id: `playlist-${Date.now()}`,
        channels,
        metadata: {
          title,
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to parse M3U content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
