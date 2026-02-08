'use client';

import { useState } from 'react';
import { usePlaylistStore } from '@iptv/core/state';
import { PlaylistParser } from '@iptv/core/playlist';
import type { SavedPlaylist } from '@iptv/core/state';

interface PlaylistManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlaylistManager({ isOpen, onClose }: PlaylistManagerProps): JSX.Element {
  const savedPlaylists = usePlaylistStore((state) => state.savedPlaylists);
  const activePlaylistId = usePlaylistStore((state) => state.activePlaylistId);
  const removeSavedPlaylist = usePlaylistStore((state) => state.removeSavedPlaylist);
  const setPlaylist = usePlaylistStore((state) => state.setPlaylist);
  const setActivePlaylistId = usePlaylistStore((state) => state.setActivePlaylistId);
  const setLoading = usePlaylistStore((state) => state.setLoading);
  const setError = usePlaylistStore((state) => state.setError);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) {
    return <></>;
  }

  const handleLoadPlaylist = async (saved: SavedPlaylist): Promise<void> => {
    try {
      setLoadingId(saved.id);
      setLoading(true);
      setError(null);

      const source = {
        type: saved.type,
        url: saved.url,
        username: saved.username,
        password: saved.password,
      };

      const playlist = await PlaylistParser.parseFromUrl(source);

      setPlaylist(playlist);
      setActivePlaylistId(saved.id);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
      setLoading(false);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = (id: string): void => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      removeSavedPlaylist(id);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl glass-strong rounded-2xl p-8 animate-scale-in max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">
            My Playlists
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {savedPlaylists.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400">No playlists saved yet</p>
              <p className="text-gray-500 text-sm mt-2">Add a playlist to get started</p>
            </div>
          ) : (
            savedPlaylists.map((saved) => (
              <div
                key={saved.id}
                className={`card-hover p-4 ${
                  activePlaylistId === saved.id ? 'ring-2 ring-accent-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {saved.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {saved.url}
                        </p>
                      </div>

                      {activePlaylistId === saved.id && (
                        <span className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs font-medium rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {saved.channelCount} channels
                      </span>
                      <span>•</span>
                      <span className="uppercase">{saved.type}</span>
                      <span>•</span>
                      <span>Updated {formatDate(saved.lastUpdated)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadPlaylist(saved)}
                      disabled={loadingId === saved.id || activePlaylistId === saved.id}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      {loadingId === saved.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : activePlaylistId === saved.id ? (
                        'Loaded'
                      ) : (
                        'Load'
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(saved.id)}
                      className="w-8 h-8 rounded-lg hover:bg-status-error/20 text-gray-400 hover:text-status-error flex items-center justify-center transition-colors"
                      aria-label="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
