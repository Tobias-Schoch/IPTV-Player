'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Playlist, Channel } from '@iptv/core/domain';
import { usePlaylistStore, selectFavoriteChannels } from '@iptv/core/state';
import { ChannelGrid } from '@/components/channels/ChannelGrid';
import { SearchBar } from '@/components/channels/SearchBar';
import { CategoryFilter } from '@/components/channels/CategoryFilter';
import { AddPlaylistModal } from '@/components/playlist/AddPlaylistModal';

export default function ChannelsPage(): JSX.Element {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const playlist = usePlaylistStore((state) => state.playlist);
  const favoriteChannels = usePlaylistStore(selectFavoriteChannels);
  const setPlaylist = usePlaylistStore((state) => state.setPlaylist);
  const setLoading = usePlaylistStore((state) => state.setLoading);
  const setError = usePlaylistStore((state) => state.setError);

  useEffect(() => {
    // Only load demo playlist if no playlist exists
    if (playlist) {
      return;
    }

    // Create demo playlist
    const demoChannels: Channel[] = [
      Channel.create({
        id: '1',
        name: 'BBC One HD',
        streamUrl: 'https://example.com/bbcone.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_2021.svg/320px-BBC_One_logo_2021.svg.png',
        groupTitle: 'UK Channels',
        metadata: {
          country: 'UK',
          language: 'en',
        },
      }),
      Channel.create({
        id: '2',
        name: 'CNN International',
        streamUrl: 'https://example.com/cnn.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/320px-CNN.svg.png',
        groupTitle: 'News',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
      Channel.create({
        id: '3',
        name: 'ESPN HD',
        streamUrl: 'https://example.com/espn.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/320px-ESPN_wordmark.svg.png',
        groupTitle: 'Sports',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
      Channel.create({
        id: '4',
        name: 'Discovery Channel',
        streamUrl: 'https://example.com/discovery.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/2019_Discovery_logo.svg/320px-2019_Discovery_logo.svg.png',
        groupTitle: 'Documentary',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
      Channel.create({
        id: '5',
        name: 'National Geographic',
        streamUrl: 'https://example.com/natgeo.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/National_Geographic_Channel.svg/320px-National_Geographic_Channel.svg.png',
        groupTitle: 'Documentary',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
      Channel.create({
        id: '6',
        name: 'MTV',
        streamUrl: 'https://example.com/mtv.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/MTV_2021_%28brand_version%29.svg/320px-MTV_2021_%28brand_version%29.svg.png',
        groupTitle: 'Entertainment',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
      Channel.create({
        id: '7',
        name: 'Sky News',
        streamUrl: 'https://example.com/skynews.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Sky_News_logo.svg/320px-Sky_News_logo.svg.png',
        groupTitle: 'News',
        metadata: {
          country: 'UK',
          language: 'en',
        },
      }),
      Channel.create({
        id: '8',
        name: 'HBO',
        streamUrl: 'https://example.com/hbo.m3u8',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/320px-HBO_logo.svg.png',
        groupTitle: 'Entertainment',
        metadata: {
          country: 'US',
          language: 'en',
        },
      }),
    ];

    const demoPlaylist = Playlist.create({
      id: 'demo-playlist',
      channels: demoChannels,
      metadata: {
        title: 'Demo Playlist',
        description: 'Sample IPTV channels for demonstration',
      },
    });

    setPlaylist(demoPlaylist);
  }, [playlist, setPlaylist]);

  const handleChannelSelect = (channel: Channel): void => {
    router.push(`/player/${channel.id}`);
  };

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Add Playlist Modal */}
      <AddPlaylistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-dark-border">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold gradient-text">
              IPTV Player
            </h1>

            <div className="flex items-center gap-3">
              {/* Playlist Info */}
              {playlist && (
                <div className="hidden sm:block px-4 py-2 bg-dark-surface rounded-lg">
                  <p className="text-xs text-gray-400">
                    {playlist.size} channels
                    {favoriteChannels.length > 0 && ` • ${favoriteChannels.length} favorites`}
                  </p>
                </div>
              )}

              {/* Add Playlist Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Playlist</span>
              </button>

              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`btn-secondary flex items-center gap-2 ${
                  showFavoritesOnly ? 'bg-status-error/20 border-status-error/50' : ''
                }`}
              >
                <svg
                  className={`w-5 h-5 ${showFavoritesOnly ? 'text-status-error fill-current' : ''}`}
                  fill={showFavoritesOnly ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8 space-y-8">
        {/* Category Filter */}
        <CategoryFilter />

        {/* Channel Grid */}
        <ChannelGrid onChannelSelect={handleChannelSelect} />
      </div>
    </main>
  );
}
