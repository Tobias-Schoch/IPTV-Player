'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaylistStore, selectChannelById } from '@iptv/core/state';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { ProgramInfo } from '@/components/epg/ProgramInfo';
import type { Channel } from '@iptv/core/domain';

export default function PlayerPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<Channel | undefined>(undefined);
  const getChannel = usePlaylistStore((state) => selectChannelById(state, channelId));

  useEffect(() => {
    const foundChannel = getChannel;
    if (foundChannel) {
      setChannel(foundChannel);
    }
  }, [channelId, getChannel]);

  if (!channel) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading channel...</p>
          <button
            onClick={() => router.push('/channels')}
            className="btn-secondary mt-4"
          >
            Back to Channels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => router.push('/channels')}
          className="glass-strong px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-white font-medium">Back</span>
        </button>
      </div>

      {/* Video Player */}
      <div className="video-player-container w-full h-screen">
        <VideoPlayer
          streamUrl={channel.streamUrl}
          channelId={channel.id}
          channelName={channel.displayName}
          autoPlay={true}
        />
      </div>

      {/* Channel Info & EPG Sidebar */}
      <div className="absolute bottom-24 right-6 z-40 max-w-md space-y-4">
        {/* EPG Program Info */}
        <ProgramInfo channelId={channel.id} />

        {/* Channel Info */}
        <div className="glass-strong p-6 rounded-xl">
        <div className="flex items-start gap-4">
          {channel.displayLogo && (
            <img
              src={channel.displayLogo}
              alt={channel.displayName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}

          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-heading font-bold text-white">
              {channel.displayName}
            </h2>

            <div className="flex items-center gap-3 text-sm text-gray-300">
              {channel.groupTitle && (
                <>
                  <span>{channel.groupTitle}</span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-status-live animate-pulse" />
                Live
              </span>
            </div>

            {(channel.metadata.country || channel.metadata.language) && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {channel.metadata.country && (
                  <span className="px-2 py-1 bg-white/10 rounded">{channel.metadata.country}</span>
                )}
                {channel.metadata.language && (
                  <span className="px-2 py-1 bg-white/10 rounded uppercase">{channel.metadata.language}</span>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
