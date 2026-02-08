'use client';

import { usePlaylistStore, selectFilteredChannels } from '@iptv/core/state';
import type { Channel } from '@iptv/core/domain';
import { ChannelCard } from './ChannelCard';

interface ChannelGridProps {
  onChannelSelect: (channel: Channel) => void;
}

export function ChannelGrid({ onChannelSelect }: ChannelGridProps): JSX.Element {
  const channels = usePlaylistStore(selectFilteredChannels);
  const isLoading = usePlaylistStore((state) => state.isLoading);
  const error = usePlaylistStore((state) => state.error);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-status-error/20 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">Error Loading Channels</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <svg className="w-20 h-20 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">No Channels Found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    );
  }

  // Channel Grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onSelect={onChannelSelect}
        />
      ))}
    </div>
  );
}
