import { create } from 'zustand';
import type { EPGProgram } from '../domain';
import { EPGParser } from '../epg';

/**
 * EPG store state
 */
interface EPGStoreState {
  // Programs
  programs: EPGProgram[];
  programsByChannel: Map<string, EPGProgram[]>;

  // EPG source
  epgUrl: string | null;
  epgFormat: 'xmltv' | 'json' | null;

  // Loading state
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  setPrograms: (programs: EPGProgram[]) => void;
  setEPGSource: (url: string, format: 'xmltv' | 'json') => void;
  loadEPG: (url: string, format?: 'xmltv' | 'json') => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearEPG: () => void;

  // Selectors
  getCurrentProgram: (channelId: string) => EPGProgram | null;
  getNextProgram: (channelId: string) => EPGProgram | null;
  getChannelPrograms: (channelId: string, hours?: number) => EPGProgram[];
}

/**
 * Initial state
 */
const initialState = {
  programs: [],
  programsByChannel: new Map(),
  epgUrl: null,
  epgFormat: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

/**
 * EPG store
 */
export const useEPGStore = create<EPGStoreState>((set, get) => ({
  ...initialState,

  setPrograms: (programs) => {
    const programsByChannel = EPGParser.groupByChannel(programs);
    set({
      programs,
      programsByChannel,
      lastUpdated: new Date(),
    });
  },

  setEPGSource: (epgUrl, epgFormat) => set({ epgUrl, epgFormat }),

  loadEPG: async (url, format) => {
    try {
      set({ isLoading: true, error: null });

      const detectedFormat = format || EPGParser.detectFormat(url);
      const programs = await EPGParser.parseFromUrl({
        url,
        format: detectedFormat,
      });

      get().setPrograms(programs);
      set({
        epgUrl: url,
        epgFormat: detectedFormat,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load EPG',
        isLoading: false,
      });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearEPG: () => set(initialState),

  // Selectors
  getCurrentProgram: (channelId) => {
    const { programs } = get();
    return EPGParser.getCurrentProgram(programs, channelId);
  },

  getNextProgram: (channelId) => {
    const { programs } = get();
    return EPGParser.getNextProgram(programs, channelId);
  },

  getChannelPrograms: (channelId, hours = 24) => {
    const { programsByChannel } = get();
    const allPrograms = programsByChannel.get(channelId) || [];

    // Filter to next N hours
    const now = new Date();
    const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return allPrograms.filter(
      (program) => program.startTime < endTime && program.endTime > now
    );
  },
}));

/**
 * Selectors
 */
export const selectHasEPG = (state: EPGStoreState): boolean =>
  state.programs.length > 0;

export const selectEPGStats = (state: EPGStoreState) => ({
  totalPrograms: state.programs.length,
  channels: state.programsByChannel.size,
  lastUpdated: state.lastUpdated,
});
