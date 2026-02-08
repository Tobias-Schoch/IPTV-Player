'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { usePlaylistStore, selectFilteredChannels } from '@iptv/core/state';
import type { Channel } from '@iptv/core/domain';
import { ChannelCard } from './ChannelCard';

interface VirtualChannelGridProps {
  onChannelSelect: (channel: Channel) => void;
}

/**
 * Virtual scrolling channel grid for high performance with 1000+ channels
 * Uses custom implementation instead of react-window for better control
 */
export function VirtualChannelGrid({ onChannelSelect }: VirtualChannelGridProps): JSX.Element {
  const channels = usePlaylistStore(selectFilteredChannels);
  const isLoading = usePlaylistStore((state) => state.isLoading);
  const error = usePlaylistStore((state) => state.error);

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerWidth, setContainerWidth] = useState(0);

  // Configuration
  const CARD_HEIGHT = 280; // Approximate height of channel card
  const CARD_MIN_WIDTH = 200;
  const CARD_MAX_WIDTH = 300;
  const GAP = 24;
  const OVERSCAN = 5; // Render extra items above/below viewport

  // Calculate columns based on container width
  const columns = useMemo(() => {
    if (containerWidth === 0) return 1;
    const availableWidth = containerWidth - GAP;
    const cols = Math.floor(availableWidth / (CARD_MIN_WIDTH + GAP));
    return Math.max(1, Math.min(cols, 6)); // 1-6 columns
  }, [containerWidth]);

  // Calculate grid dimensions
  const rows = Math.ceil(channels.length / columns);
  const totalHeight = rows * (CARD_HEIGHT + GAP);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = (): void => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Handle scroll to update visible range
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = (): void => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const startRow = Math.floor(scrollTop / (CARD_HEIGHT + GAP));
      const endRow = Math.ceil((scrollTop + viewportHeight) / (CARD_HEIGHT + GAP));

      const start = Math.max(0, (startRow - OVERSCAN) * columns);
      const end = Math.min(channels.length, (endRow + OVERSCAN) * columns);

      setVisibleRange({ start, end });
    };

    handleScroll(); // Initial calculation
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [channels.length, columns, CARD_HEIGHT, GAP, OVERSCAN]);

  // Get visible channels
  const visibleChannels = useMemo(() => {
    return channels.slice(visibleRange.start, visibleRange.end);
  }, [channels, visibleRange]);

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

  return (
    <div>
      {/* Stats */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
        <p>Showing {channels.length} channels</p>
        <p>{columns} columns</p>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={containerRef}
        className="relative overflow-auto"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible Items */}
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              position: 'absolute',
              top: Math.floor(visibleRange.start / columns) * (CARD_HEIGHT + GAP),
              left: 0,
              right: 0,
            }}
          >
            {visibleChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSelect={onChannelSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
