'use client';

import { useState } from 'react';
import { PlaylistParser } from '@iptv/core/playlist';
import type { PlaylistSource, PlaylistFormat } from '@iptv/core/playlist';
import { usePlaylistStore } from '@iptv/core/state';

interface AddPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPlaylistModal({ isOpen, onClose }: AddPlaylistModalProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'m3u' | 'xtream'>('m3u');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPlaylist = usePlaylistStore((state) => state.setPlaylist);
  const setPlaylistLoading = usePlaylistStore((state) => state.setLoading);
  const setPlaylistError = usePlaylistStore((state) => state.setError);

  if (!isOpen) {
    return <></>;
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!url.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    if (!PlaylistParser.isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    if (activeTab === 'xtream' && (!username.trim() || !password.trim())) {
      setError('Username and password are required for Xtream Codes');
      return;
    }

    try {
      setIsLoading(true);
      setPlaylistLoading(true);

      const source: PlaylistSource = {
        type: activeTab === 'xtream' ? 'xtream' : PlaylistParser.detectFormat(url),
        url,
        username: activeTab === 'xtream' ? username : undefined,
        password: activeTab === 'xtream' ? password : undefined,
      };

      const playlist = await PlaylistParser.parseFromUrl(source);

      setPlaylist(playlist);
      setPlaylistLoading(false);

      // Close modal
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
      setPlaylistLoading(false);
      setPlaylistError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setUrl('');
    setUsername('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl glass-strong rounded-2xl p-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-white">
            Add Playlist
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('m3u')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'm3u'
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
            }`}
          >
            M3U / M3U8
          </button>
          <button
            onClick={() => setActiveTab('xtream')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'xtream'
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
            }`}
          >
            Xtream Codes
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* M3U Tab */}
          {activeTab === 'm3u' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlist URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u8"
                  className="input"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the URL of your M3U or M3U8 playlist file
                </p>
              </div>

              <div className="bg-dark-surface/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-300">Examples:</p>
                <div className="space-y-1 text-xs text-gray-400 font-mono">
                  <p>• https://example.com/playlist.m3u</p>
                  <p>• https://example.com/playlist.m3u8</p>
                  <p>• https://pastebin.com/raw/ABC123</p>
                </div>
              </div>
            </div>
          )}

          {/* Xtream Codes Tab */}
          {activeTab === 'xtream' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://example.com:8080"
                  className="input"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter your Xtream Codes server URL (without /player_api.php)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="your_password"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="bg-dark-surface/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-300">ℹ️ What is Xtream Codes?</p>
                <p className="text-xs text-gray-400">
                  Xtream Codes is a popular IPTV panel system. Your provider should give you a server URL, username, and password. This format is also known as &quot;Xtream API&quot; or &quot;Player API&quot;.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-status-error/20 border border-status-error/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-status-error">{error}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Add Playlist'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
