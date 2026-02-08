'use client';

import { usePlaylistStore, selectGroups } from '@iptv/core/state';

export function CategoryFilter(): JSX.Element {
  const groups = usePlaylistStore(selectGroups);
  const selectedGroup = usePlaylistStore((state) => state.selectedGroup);
  const setSelectedGroup = usePlaylistStore((state) => state.setSelectedGroup);

  if (groups.length === 0) {
    return <></>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Categories
      </h3>

      <div className="flex flex-wrap gap-2">
        {/* All Channels */}
        <button
          onClick={() => setSelectedGroup(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedGroup === null
              ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow'
              : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
          }`}
        >
          All Channels
        </button>

        {/* Groups */}
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedGroup === group
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow'
                : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
            }`}
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  );
}
