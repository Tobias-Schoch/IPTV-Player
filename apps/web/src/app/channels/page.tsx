'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Playlist, Channel } from '@iptv/core/domain';
import { usePlaylistStore } from '@iptv/core/state';
import { ChannelGrid } from '@/components/channels/ChannelGrid';
import { SearchBar } from '@/components/channels/SearchBar';
import { CategoryFilter } from '@/components/channels/CategoryFilter';

export default function ChannelsPage(): JSX.Element {
  const router = useRouter();
  const setPlaylist = usePlaylistStore((state) => state.setPlaylist);
  const setLoading = usePlaylistStore((state) => state.setLoading);
  const setError = usePlaylistStore((state) => state.setError);

  useEffect(() => {
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

    const playlist = Playlist.create({
      id: 'demo-playlist',
      channels: demoChannels,
      metadata: {
        title: 'Demo Playlist',
        description: 'Sample IPTV channels for demonstration',
      },
    });

    setPlaylist(playlist);
  }, [setPlaylist]);

  const handleChannelSelect = (channel: Channel): void => {
    router.push(`/player/${channel.id}`);
  };

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-dark-border">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold gradient-text">
              IPTV Player
            </h1>

            <div className="flex items-center gap-4">
              <button className="btn-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Favorites
              </button>

              <button className="btn-secondary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
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
