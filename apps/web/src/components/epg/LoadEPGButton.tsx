'use client';

import { useState } from 'react';
import { useEPGStore, selectEPGStats } from '@iptv/core/state';

export function LoadEPGButton(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'xmltv' | 'json'>('xmltv');

  const loadEPG = useEPGStore((state) => state.loadEPG);
  const isLoading = useEPGStore((state) => state.isLoading);
  const error = useEPGStore((state) => state.error);
  const stats = useEPGStore(selectEPGStats);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    await loadEPG(url, format);

    if (!error) {
      setIsModalOpen(false);
      setUrl('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-secondary flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {stats.totalPrograms > 0 ? `EPG (${stats.channels} ch)` : 'Load EPG'}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-strong rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-white">
                Load EPG
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  EPG URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/epg.xml"
                  className="input"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the URL to your XMLTV or JSON EPG file
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('xmltv')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      format === 'xmltv'
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                        : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
                    }`}
                  >
                    XMLTV
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('json')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      format === 'json'
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white'
                        : 'bg-dark-surface text-gray-300 hover:bg-dark-elevated'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-status-error/20 border border-status-error/50 rounded-lg p-4">
                  <p className="text-sm text-status-error">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Load EPG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
