import { EPGProgram } from '../domain';

/**
 * EPG format types
 */
export type EPGFormat = 'xmltv' | 'json';

/**
 * EPG source
 */
export interface EPGSource {
  readonly format: EPGFormat;
  readonly url: string;
}

/**
 * JSON EPG Program
 */
interface JSONEPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category?: string;
  posterUrl?: string;
  rating?: string;
  season?: number;
  episode?: number;
}

/**
 * EPG Parser - Supports XMLTV and JSON formats
 */
export class EPGParser {
  /**
   * Parse EPG from URL
   */
  static async parseFromUrl(source: EPGSource): Promise<EPGProgram[]> {
    if (source.format === 'xmltv') {
      return this.parseXMLTV(source.url);
    } else {
      return this.parseJSON(source.url);
    }
  }

  /**
   * Parse XMLTV format
   */
  static async parseXMLTV(url: string): Promise<EPGProgram[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch EPG: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XMLTV format');
      }

      // Parse programs
      const programElements = xmlDoc.querySelectorAll('programme');
      const programs: EPGProgram[] = [];

      programElements.forEach((programEl) => {
        try {
          const channelId = programEl.getAttribute('channel');
          const startStr = programEl.getAttribute('start');
          const stopStr = programEl.getAttribute('stop');

          if (!channelId || !startStr || !stopStr) {
            return; // Skip invalid entries
          }

          const titleEl = programEl.querySelector('title');
          const descEl = programEl.querySelector('desc');
          const categoryEl = programEl.querySelector('category');
          const iconEl = programEl.querySelector('icon');
          const ratingEl = programEl.querySelector('rating value');
          const episodeEl = programEl.querySelector('episode-num');

          const title = titleEl?.textContent || 'Unknown Program';
          const description = descEl?.textContent || null;
          const category = categoryEl?.textContent || null;
          const posterUrl = iconEl?.getAttribute('src') || null;
          const rating = ratingEl?.textContent || null;

          // Parse episode number (format: S01E05 or 0.4.0/1)
          let season: number | undefined = undefined;
          let episode: number | undefined = undefined;

          if (episodeEl) {
            const system = episodeEl.getAttribute('system');
            const value = episodeEl.textContent;

            if (value) {
              if (system === 'onscreen') {
                // Format: S01E05
                const match = value.match(/S(\d+)E(\d+)/i);
                if (match?.[1] && match?.[2]) {
                  season = parseInt(match[1], 10);
                  episode = parseInt(match[2], 10);
                }
              } else {
                // Format: 0.4.0/1 (season.episode.part/total)
                const parts = value.split('.');
                if (parts.length >= 2 && parts[0] && parts[1]) {
                  season = parseInt(parts[0], 10) + 1; // 0-indexed
                  episode = parseInt(parts[1], 10) + 1;
                }
              }
            }
          }

          const program = EPGProgram.create({
            id: `${channelId}-${startStr}`,
            channelId,
            title,
            startTime: this.parseXMLTVTime(startStr),
            endTime: this.parseXMLTVTime(stopStr),
            description: description ?? undefined,
            category: category ?? undefined,
            posterUrl: posterUrl ?? undefined,
            rating: rating ?? undefined,
            season,
            episode,
          });

          programs.push(program);
        } catch (err) {
          console.warn('Failed to parse EPG program:', err);
        }
      });

      return programs;
    } catch (error) {
      throw new Error(`Failed to parse XMLTV EPG: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse JSON EPG format
   */
  static async parseJSON(url: string): Promise<EPGProgram[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch EPG: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid JSON EPG format');
      }

      const programs: EPGProgram[] = data.map((item: JSONEPGProgram) => {
        return EPGProgram.create({
          id: item.id,
          channelId: item.channelId,
          title: item.title,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          description: item.description,
          category: item.category,
          posterUrl: item.posterUrl,
          rating: item.rating,
          season: item.season,
          episode: item.episode,
        });
      });

      return programs;
    } catch (error) {
      throw new Error(`Failed to parse JSON EPG: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse XMLTV time format (YYYYMMDDHHmmss +offset)
   */
  private static parseXMLTVTime(timeStr: string): Date {
    // Format: 20240108120000 +0000
    const datePart = timeStr.substring(0, 14);
    const offsetPart = timeStr.substring(15);

    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10) - 1; // 0-indexed
    const day = parseInt(datePart.substring(6, 8), 10);
    const hour = parseInt(datePart.substring(8, 10), 10);
    const minute = parseInt(datePart.substring(10, 12), 10);
    const second = parseInt(datePart.substring(12, 14), 10);

    const date = new Date(Date.UTC(year, month, day, hour, minute, second));

    // Apply timezone offset
    if (offsetPart) {
      const sign = offsetPart[0] === '+' ? 1 : -1;
      const offsetHours = parseInt(offsetPart.substring(1, 3), 10);
      const offsetMinutes = parseInt(offsetPart.substring(3, 5), 10);
      const offsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60 * 1000;
      date.setTime(date.getTime() - offsetMs);
    }

    return date;
  }

  /**
   * Detect EPG format from URL
   */
  static detectFormat(url: string): EPGFormat {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.endsWith('.xml') || lowerUrl.includes('xmltv')) {
      return 'xmltv';
    }

    return 'json';
  }

  /**
   * Filter programs by time range
   */
  static filterByTimeRange(
    programs: EPGProgram[],
    startTime: Date,
    endTime: Date
  ): EPGProgram[] {
    return programs.filter(
      (program) =>
        program.startTime < endTime && program.endTime > startTime
    );
  }

  /**
   * Get current program for a channel
   */
  static getCurrentProgram(
    programs: EPGProgram[],
    channelId: string,
    now: Date = new Date()
  ): EPGProgram | null {
    return (
      programs.find(
        (program) =>
          program.channelId === channelId &&
          program.startTime <= now &&
          program.endTime > now
      ) || null
    );
  }

  /**
   * Get next program for a channel
   */
  static getNextProgram(
    programs: EPGProgram[],
    channelId: string,
    now: Date = new Date()
  ): EPGProgram | null {
    const futurePrograms = programs
      .filter(
        (program) =>
          program.channelId === channelId && program.startTime > now
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return futurePrograms[0] || null;
  }

  /**
   * Group programs by channel
   */
  static groupByChannel(programs: EPGProgram[]): Map<string, EPGProgram[]> {
    const grouped = new Map<string, EPGProgram[]>();

    for (const program of programs) {
      const channelPrograms = grouped.get(program.channelId) || [];
      channelPrograms.push(program);
      grouped.set(program.channelId, channelPrograms);
    }

    // Sort programs by start time for each channel
    for (const [channelId, channelPrograms] of grouped.entries()) {
      channelPrograms.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
      grouped.set(channelId, channelPrograms);
    }

    return grouped;
  }
}
