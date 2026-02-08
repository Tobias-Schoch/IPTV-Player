'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Channel } from '@iptv/core/domain';
import { usePlaylistStore, selectIsFavorite } from '@iptv/core/state';

interface ChannelCardProps {
  channel: Channel;
  onSelect: (channel: Channel) => void;
}

export function ChannelCard({ channel, onSelect }: ChannelCardProps): JSX.Element {
  const [imageError, setImageError] = useState(false);
  const isFavorite = usePlaylistStore((state) => selectIsFavorite(state, channel.id));
  const toggleFavorite = usePlaylistStore((state) => state.toggleFavorite);

  const handleFavoriteClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  return (
    <div
      onClick={() => onSelect(channel)}
      className="card-hover cursor-pointer group relative"
    >
      {/* Channel Logo/Poster */}
      <div className="relative aspect-video bg-dark-surface rounded-lg overflow-hidden mb-3">
        {channel.displayLogo && !imageError ? (
          <Image
            src={channel.displayLogo}
            alt={channel.displayName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-surface to-dark-elevated">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-status-error fill-current' : 'text-white'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
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
        </button>

        {/* Play Icon (on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Channel Info */}
      <div className="space-y-1">
        <h3 className="text-white font-semibold truncate group-hover:text-accent-primary transition-colors">
          {channel.displayName}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          {channel.groupTitle && (
            <>
              <span className="truncate">{channel.groupTitle}</span>
              <span>•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
            Live
          </span>
        </div>

        {/* Metadata */}
        {(channel.metadata.country || channel.metadata.language) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {channel.metadata.country && <span>{channel.metadata.country}</span>}
            {channel.metadata.country && channel.metadata.language && <span>•</span>}
            {channel.metadata.language && <span className="uppercase">{channel.metadata.language}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
