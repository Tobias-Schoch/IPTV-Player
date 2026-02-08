export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-dark-bg to-accent-secondary/20" />

        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-8xl font-heading font-bold mb-6 animate-fade-in">
            <span className="gradient-text">IPTV Player</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            A professional-grade streaming experience with world-class UI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <button className="btn-primary text-lg px-8 py-4">
              Get Started
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-center mb-16 gradient-text">
            Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">HLS/DASH Streaming</h3>
              <p className="text-gray-400">Adaptive bitrate streaming with Shaka Player and HLS.js</p>
            </div>

            {/* Feature Card 2 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">EPG Support</h3>
              <p className="text-gray-400">Electronic Program Guide with timeline view</p>
            </div>

            {/* Feature Card 3 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">&lt;2s launch time, &lt;1s channel switching</p>
            </div>

            {/* Feature Card 4 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform</h3>
              <p className="text-gray-400">Web browsers and Samsung Smart TVs (2022+)</p>
            </div>

            {/* Feature Card 5 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Clean Architecture</h3>
              <p className="text-gray-400">Type-safe TypeScript with SOLID principles</p>
            </div>

            {/* Feature Card 6 */}
            <div className="card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Beautiful UI</h3>
              <p className="text-gray-400">World-class design that makes you say &quot;WOW&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6 bg-dark-surface/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-heading font-bold mb-8">Built with Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400">
            <span className="px-4 py-2 glass rounded-lg">TypeScript</span>
            <span className="px-4 py-2 glass rounded-lg">Next.js 16</span>
            <span className="px-4 py-2 glass rounded-lg">React 19</span>
            <span className="px-4 py-2 glass rounded-lg">Tailwind CSS</span>
            <span className="px-4 py-2 glass rounded-lg">Shaka Player</span>
            <span className="px-4 py-2 glass rounded-lg">Zustand</span>
            <span className="px-4 py-2 glass rounded-lg">Turborepo</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-dark-border">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 IPTV Player. Built with ❤️ by Tobias Schoch</p>
        </div>
      </footer>
    </main>
  );
}
