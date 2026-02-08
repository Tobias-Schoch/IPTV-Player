'use client';

import { useState, useEffect } from 'react';
import { usePlaylistStore } from '@iptv/core/state';
import { debounce } from '@/lib/utils';

export function SearchBar(): JSX.Element {
  const [localQuery, setLocalQuery] = useState('');
  const setSearchQuery = usePlaylistStore((state) => state.setSearchQuery);
  const currentQuery = usePlaylistStore((state) => state.searchQuery);

  // Debounced search
  useEffect(() => {
    const debouncedSearch = debounce((query: string) => {
      setSearchQuery(query);
    }, 300);

    debouncedSearch(localQuery);
  }, [localQuery, setSearchQuery]);

  const handleClear = (): void => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Search channels by name, group, country..."
        className="w-full pl-12 pr-12 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
      />

      {/* Clear Button */}
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Results Count */}
      {currentQuery && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
          Searching for &quot;{currentQuery}&quot;
        </div>
      )}
    </div>
  );
}
