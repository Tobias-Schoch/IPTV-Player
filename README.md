# IPTV Player

A professional-grade IPTV player for Web and TizenOS (Samsung Smart TV) platforms.

## Features

- 🎬 **Multi-Platform**: Runs on Web browsers and Samsung Smart TVs (2022+)
- 📺 **HLS/DASH Streaming**: Support for adaptive bitrate streaming
- 📋 **M3U/M3U8 Playlists**: Import standard IPTV playlists
- 📺 **EPG Support**: Electronic Program Guide integration
- 🎨 **World-Class UI**: Beautiful, modern interface with smooth animations
- ⚡ **High Performance**: <2s launch time, <1s channel switching
- 🔒 **Type-Safe**: 100% TypeScript codebase
- 🏗️ **Clean Architecture**: SOLID principles, testable, maintainable

## Tech Stack

### Core
- **TypeScript** - 100% type-safe codebase
- **pnpm** + **Turborepo** - Monorepo management
- **Zustand** - State management
- **iptv-m3u-playlist-parser** - M3U playlist parsing

### Web Platform
- **React 19** + **Next.js 16** - Modern React framework
- **Tailwind CSS** - Utility-first styling
- **Shaka Player** + **HLS.js** - Video playback
- **Framer Motion** - Smooth animations

### TizenOS Platform
- **Vanilla JavaScript** + **Web Components** - Memory-optimized
- **AVPlay API** - Native Tizen video playback
- **Custom Focus Manager** - Remote control navigation

## Project Structure

```
iptvPlayer/
├── apps/
│   ├── web/              # Next.js web application
│   └── tizen/            # TizenOS application
├── packages/
│   ├── core/             # Shared business logic
│   ├── types/            # TypeScript type definitions
│   ├── ui-components/    # Shared UI components
│   └── utils/            # Shared utilities
└── configs/              # Shared configurations
```

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm 10+
- Docker (optional, recommended)

### Quick Start with Docker (Recommended)

```bash
# Development mode (with hot reload)
docker-compose --profile dev up web-dev

# Production mode
docker-compose up -d web

# Access at http://localhost:3000
```

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development
npm run dev

# Or start web app only
npm run dev:web
```

### Development Commands

```bash
# Run web app
npm run dev:web

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Start containers
npm run docker:up

# Stop containers
npm run docker:down

# View logs
npm run docker:logs
```

## Architecture

### Clean Architecture Layers

```
┌────────────────────────────────────────────┐
│   UI Layer (React / Web Components)        │
├────────────────────────────────────────────┤
│   State Management (Zustand)               │
├────────────────────────────────────────────┤
│   Use Cases / Business Logic               │
├────────────────────────────────────────────┤
│   Domain Models (Channel, Playlist, EPG)   │
├────────────────────────────────────────────┤
│   Player Abstraction (IVideoPlayer)        │
│   ┌──────────┬──────────┬──────────┐      │
│   │  Shaka   │  HLS.js  │  AVPlay  │      │
│   └──────────┴──────────┴──────────┘      │
└────────────────────────────────────────────┘
```

### Key Design Patterns

- **Strategy Pattern**: Player abstraction (`IVideoPlayer` interface)
- **Factory Pattern**: Dynamic player selection (`PlayerFactory`)
- **Immutable Domain Models**: All domain entities are immutable
- **Error Recovery**: Automatic retry with exponential backoff

## Performance Targets

### Web
- Initial load: <2 seconds
- Time to first frame: <3 seconds
- Channel switch: <1 second
- Lighthouse score: >90

### TizenOS
- Launch time: <2 seconds
- Memory usage: <150MB
- Channel switch: <1 second
- Smooth 60fps navigation

## Current Status

**Phase 1: Foundation** ✅ **COMPLETE**
- [x] Monorepo setup with npm workspaces + Turborepo
- [x] TypeScript strict mode configuration
- [x] Domain models (Channel, Playlist, EPGProgram)
- [x] Player interface (IVideoPlayer)
- [x] Player factory with automatic selection
- [x] Error handling and recovery with exponential backoff
- [x] Docker setup (development + production)

**Phase 2: Core Player Implementations** ✅ **COMPLETE**
- [x] **Shaka Player** - HLS/DASH/DRM support for Web
- [x] **HLS.js Player** - HLS fallback for Web
- [x] **Native Player** - Progressive video for Web
- [x] **AVPlay Player** - Samsung Tizen 2022+ with DTS audio handling
- [x] All players implement IVideoPlayer interface
- [x] Automatic player selection by platform/format

**Phase 3: UI Implementation** ✅ **COMPLETE**
- [x] Next.js 16 + React 19 web app structure
- [x] Tailwind CSS with world-class design system
- [x] Beautiful landing page with "WOW" factor
- [x] **VideoPlayer** component with PlayerFactory integration
- [x] **PlayerControls** (play/pause, seek, volume, fullscreen)
- [x] **ChannelGrid** with responsive layout
- [x] **ChannelCard** with hover effects and favorites
- [x] **SearchBar** with debounced search
- [x] **CategoryFilter** for groups
- [x] **State management** with Zustand (player + playlist stores)
- [x] Loading and error states
- [x] Demo playlist with 8 channels

**Phase 4: Playlist Integration** ✅ **COMPLETE**
- [x] **M3U/M3U8 Parser** - Full support for standard IPTV playlists
- [x] **Xtream Codes API** - Professional IPTV panel integration
- [x] **Add Playlist Modal** - Beautiful UI for adding playlists
- [x] **Auto-detect format** - Automatically detects M3U vs Xtream
- [x] **Playlist validation** - URL validation and error handling
- [x] **Test playlist** - Included with working streams (NASA, Red Bull TV, etc.)

**Phase 5: Advanced Features** ✅ **COMPLETE**
- [x] **Playlist Persistence** - Auto-save to localStorage
- [x] **Multiple Playlists** - Playlist Manager UI
- [x] **Virtual Scrolling** - Custom implementation for 10000+ channels
- [x] **EPG Integration** - XMLTV + JSON parser
- [x] **Program Info** - Current/next program display
- [x] **EPG Progress** - Real-time progress bars

**Phase 6: Polish & Production** (Next)
- [ ] Keyboard shortcuts
- [ ] Picture-in-Picture
- [ ] EPG timeline view
- [ ] VOD Support (Xtream movies/series)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimizations

## License

MIT

## Author

Tobias Schoch
