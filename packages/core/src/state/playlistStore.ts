import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Channel, Playlist } from '../domain';

/**
 * Saved playlist metadata
 */
export interface SavedPlaylist {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly type: 'm3u' | 'm3u8' | 'xtream';
  readonly username?: string;
  readonly password?: string;
  readonly channelCount: number;
  readonly lastUpdated: Date;
}

/**
 * Playlist store state
 */
interface PlaylistStoreState {
  // Active playlist
  playlist: Playlist | null;

  // Saved playlists
  savedPlaylists: SavedPlaylist[];
  activePlaylistId: string | null;

  // Favorites
  favoriteChannelIds: Set<string>;

  // Search & Filter
  searchQuery: string;
  selectedGroup: string | null;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  setPlaylist: (playlist: Playlist) => void;
  addChannel: (channel: Channel) => void;
  removeChannel: (channelId: string) => void;
  toggleFavorite: (channelId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGroup: (group: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Playlist management
  savePlaylist: (saved: SavedPlaylist) => void;
  removeSavedPlaylist: (id: string) => void;
  setActivePlaylistId: (id: string | null) => void;
  getSavedPlaylist: (id: string) => SavedPlaylist | undefined;
}

/**
 * Initial state
 */
const initialState = {
  playlist: null,
  savedPlaylists: [],
  activePlaylistId: null,
  favoriteChannelIds: new Set<string>(),
  searchQuery: '',
  selectedGroup: null,
  isLoading: false,
  error: null,
};

/**
 * Playlist store with persistence
 */
export const usePlaylistStore = create<PlaylistStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlaylist: (playlist) => set({ playlist }),

      addChannel: (channel) => {
        const { playlist } = get();
        if (playlist) {
          set({ playlist: playlist.addChannel(channel) });
        }
      },

      removeChannel: (channelId) => {
        const { playlist, favoriteChannelIds } = get();
        if (playlist) {
          const newFavorites = new Set(favoriteChannelIds);
          newFavorites.delete(channelId);
          set({
            playlist: playlist.removeChannel(channelId),
            favoriteChannelIds: newFavorites,
          });
        }
      },

      toggleFavorite: (channelId) => {
        const { favoriteChannelIds } = get();
        const newFavorites = new Set(favoriteChannelIds);

        if (newFavorites.has(channelId)) {
          newFavorites.delete(channelId);
        } else {
          newFavorites.add(channelId);
        }

        set({ favoriteChannelIds: newFavorites });
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setSelectedGroup: (selectedGroup) => set({ selectedGroup }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),

      // Playlist management
      savePlaylist: (saved) => {
        const { savedPlaylists } = get();
        const existing = savedPlaylists.findIndex((p) => p.id === saved.id);

        if (existing >= 0) {
          // Update existing
          const updated = [...savedPlaylists];
          updated[existing] = saved;
          set({ savedPlaylists: updated });
        } else {
          // Add new
          set({ savedPlaylists: [...savedPlaylists, saved] });
        }
      },

      removeSavedPlaylist: (id) => {
        const { savedPlaylists, activePlaylistId } = get();
        set({
          savedPlaylists: savedPlaylists.filter((p) => p.id !== id),
          activePlaylistId: activePlaylistId === id ? null : activePlaylistId,
        });
      },

      setActivePlaylistId: (activePlaylistId) => set({ activePlaylistId }),

      getSavedPlaylist: (id) => {
        return get().savedPlaylists.find((p) => p.id === id);
      },
    }),
    {
      name: 'iptv-playlist-storage',
      partialize: (state) => ({
        savedPlaylists: state.savedPlaylists,
        activePlaylistId: state.activePlaylistId,
        favoriteChannelIds: Array.from(state.favoriteChannelIds),
      }),
    }
  )
);

/**
 * Selectors
 */
export const selectFilteredChannels = (state: PlaylistStoreState): readonly Channel[] => {
  const { playlist, searchQuery, selectedGroup } = state;

  if (!playlist) {
    return [];
  }

  let channels = playlist.channels;

  // Filter by group
  if (selectedGroup) {
    channels = channels.filter((channel) => channel.groupTitle === selectedGroup);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    channels = channels.filter((channel) => channel.matchesSearch(searchQuery));
  }

  return channels;
};

export const selectFavoriteChannels = (state: PlaylistStoreState): readonly Channel[] => {
  const { playlist, favoriteChannelIds } = state;

  if (!playlist) {
    return [];
  }

  return playlist.channels.filter((channel) => favoriteChannelIds.has(channel.id));
};

export const selectGroups = (state: PlaylistStoreState): readonly string[] => {
  return state.playlist?.getGroups() ?? [];
};

export const selectChannelById = (
  state: PlaylistStoreState,
  channelId: string
): Channel | undefined => {
  return state.playlist?.getChannelById(channelId);
};

export const selectIsFavorite = (state: PlaylistStoreState, channelId: string): boolean => {
  return state.favoriteChannelIds.has(channelId);
};
