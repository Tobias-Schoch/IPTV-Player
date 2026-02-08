# Playlist Integration - COMPLETE ✅

## What's New

### 1. M3U/M3U8 Parser

Full support for standard IPTV playlist format:

```typescript
// Parse from URL
const playlist = await PlaylistParser.parseM3U('https://example.com/playlist.m3u8');

// Parse from text
const playlist = PlaylistParser.parseFromText(m3uContent, 'My Playlist');
```

#### Supported Attributes
- ✅ `tvg-id` - Channel ID (for EPG)
- ✅ `tvg-name` - Alternative name
- ✅ `tvg-logo` - Channel logo URL
- ✅ `group-title` - Category/group
- ✅ `tvg-country` - Country code
- ✅ `tvg-language` - Language code
- ✅ `http-referrer` - Custom referrer
- ✅ `http-user-agent` - Custom user agent

### 2. Xtream Codes API

Professional IPTV panel integration:

```typescript
const playlist = await PlaylistParser.parseXtreamCodes({
  type: 'xtream',
  url: 'http://example.com:8080',
  username: 'your_username',
  password: 'your_password',
});
```

#### Features
- ✅ Live streams
- ✅ Categories/groups
- ✅ Channel metadata
- ✅ Automatic stream URL generation
- ✅ Error handling

### 3. Add Playlist Modal

Beautiful UI component for adding playlists:

#### M3U Tab
- URL input with validation
- Examples shown
- Format auto-detection

#### Xtream Codes Tab
- Server URL input
- Username/password fields
- Information tooltip

#### Features
- ✅ Form validation
- ✅ Loading states
- ✅ Error messages
- ✅ Smooth animations
- ✅ Keyboard support (Enter to submit, Esc to close)

### 4. Updated Channel Browser

#### New Features
- ✅ "Add Playlist" button in header
- ✅ Playlist info (channel count, favorites)
- ✅ Demo playlist loads only if no custom playlist
- ✅ Favorites toggle button
- ✅ Smooth transitions

## Usage

### Quick Start

1. **Start the app**
   ```bash
   docker-compose --profile dev up web-dev
   # or
   npm run dev:web
   ```

2. **Navigate to Channels**
   - Go to `http://localhost:3000/channels`

3. **Add a Playlist**
   - Click "Add Playlist" button
   - Choose format (M3U or Xtream Codes)
   - Enter details
   - Click "Add Playlist"

### Test with Included Playlist

A test playlist is included at `/public/test_playlist.m3u` with **working streams**:

1. Click "Add Playlist"
2. Enter URL: `http://localhost:3000/test_playlist.m3u`
3. Click "Add Playlist"

Channels include:
- 🎬 Big Buck Bunny (Blender short film)
- 🎬 Tears of Steel (Blender short film)
- 🎬 Sintel (Blender short film)
- 🧪 Apple HLS Test Streams
- 🏁 Red Bull TV (Live)
- 🚀 NASA TV (Live)
- 🛰️ ISS HD Earth Viewing (Live)

### M3U Format Example

```m3u
#EXTM3U

#EXTINF:-1 tvg-id="bbc1" tvg-name="BBC One HD" tvg-logo="https://example.com/bbc1.png" group-title="UK",BBC One HD
https://example.com/bbc1.m3u8

#EXTINF:-1 tvg-id="cnn" tvg-name="CNN" tvg-logo="https://example.com/cnn.png" group-title="News",CNN International
https://example.com/cnn.m3u8
```

### Xtream Codes Example

Provider gives you:
```
Server: http://example.com:8080
Username: john_doe
Password: secret123
```

Enter in modal, channels load automatically from:
```
http://example.com:8080/player_api.php?username=john_doe&password=secret123&action=get_live_streams
```

## Architecture

### PlaylistParser

```typescript
class PlaylistParser {
  // Parse from URL (auto-detect format)
  static async parseFromUrl(source: PlaylistSource): Promise<Playlist>

  // Parse M3U content
  static async parseM3U(url: string): Promise<Playlist>

  // Parse Xtream Codes API
  static async parseXtreamCodes(source: PlaylistSource): Promise<Playlist>

  // Parse from text content
  static parseFromText(content: string, title?: string): Playlist

  // Detect format from URL
  static detectFormat(url: string): PlaylistFormat

  // Validate URL
  static isValidUrl(url: string): boolean
}
```

### PlaylistSource Interface

```typescript
interface PlaylistSource {
  readonly type: PlaylistFormat; // 'm3u' | 'm3u8' | 'xtream'
  readonly url: string;
  readonly username?: string;    // For Xtream Codes
  readonly password?: string;    // For Xtream Codes
}
```

### Data Flow

```
User Input → Validation → PlaylistParser
                              ↓
                    [M3U or Xtream API]
                              ↓
                    Channel[] → Playlist
                              ↓
                    usePlaylistStore
                              ↓
                    ChannelGrid → UI
```

## Error Handling

### Network Errors
- Failed to fetch playlist
- Invalid URL
- CORS issues
- Timeout

### Format Errors
- Invalid M3U format
- Missing #EXTM3U header
- Malformed channel entries

### API Errors
- Invalid credentials (Xtream)
- Server not responding
- Empty response
- Invalid JSON

### User-Friendly Messages
All errors show helpful messages to the user with retry options.

## Performance

### M3U Parsing
- ⚡ Fast parsing with `iptv-m3u-playlist-parser`
- ⚡ Async loading (non-blocking)
- ⚡ Progress indication

### Xtream Codes
- ⚡ Parallel API calls (streams + categories)
- ⚡ Efficient data mapping
- ⚡ Cached category lookups

## Security

### Credentials Protection
- ✅ Passwords use `type="password"`
- ✅ Credentials not stored in localStorage (yet)
- ✅ HTTPS recommended for Xtream URLs
- ✅ URL validation before fetch

### CORS Handling
- Web browsers enforce CORS
- Use CORS proxy if needed
- Or load from same origin

## Free Test Resources

### Working M3U Playlists

1. **Included Test Playlist**
   ```
   http://localhost:3000/test_playlist.m3u
   ```

2. **Public Test Streams**
   - Big Buck Bunny: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
   - Tears of Steel: `https://demo.unified-streaming.com/.../tears-of-steel.ism/.m3u8`
   - Apple Tests: `https://devstreaming-cdn.apple.com/videos/...`

3. **Free IPTV Lists** (use responsibly)
   - GitHub: Search for "free iptv m3u"
   - Be aware of copyright and legality

### Xtream Codes Test

Most Xtream providers offer paid subscriptions. Test with:
- Demo accounts from providers
- Your own subscription
- Free trials (if available)

## Known Limitations

### Current Version
- ⚠️ **No playlist management** - Can only load one playlist (will be improved)
- ⚠️ **No persistence** - Playlist reloads on refresh (will add)
- ⚠️ **No VOD/Series** - Only live streams (Xtream has more)
- ⚠️ **No catch-up** - Xtream supports timeshift (future feature)

### Browser Limitations
- CORS restrictions for cross-origin M3U files
- LocalStorage limits (~5MB for favorites)
- Memory limits for huge playlists (1000+ channels OK, 10000+ may lag)

## Next Steps

### Phase 5 Plans
1. **Multiple Playlists** - Load and switch between playlists
2. **Playlist Persistence** - Save playlists to localStorage
3. **VOD Support** - Xtream movies and series
4. **EPG Integration** - TV guide with program info
5. **Virtual Scrolling** - Handle 10000+ channels efficiently

## Documentation

See also:
- [Playlist Formats Guide](./docs/PLAYLIST_FORMATS.md) - Detailed format documentation
- [README.md](./README.md) - Main project documentation
- [Phase 3 Complete](./PHASE_3_COMPLETE.md) - UI implementation details

## Testing Checklist

### M3U Testing
- [x] Load from URL
- [x] Parse channel names
- [x] Parse logos
- [x] Parse groups
- [x] Parse metadata (country, language)
- [x] Handle invalid M3U
- [x] Handle network errors
- [x] Show loading state
- [x] Show error messages

### Xtream Testing
- [ ] Authenticate with credentials *(needs real provider)*
- [ ] Load live streams
- [ ] Load categories
- [ ] Generate stream URLs
- [ ] Handle auth errors
- [ ] Handle network errors
- [ ] Show loading state
- [ ] Show error messages

### UI Testing
- [x] Modal opens/closes
- [x] Tab switching
- [x] Form validation
- [x] Loading spinner
- [x] Error messages
- [x] Keyboard support (Enter, Esc)
- [x] Responsive design
- [x] Smooth animations

## Changelog

### v1.0.0 - Playlist Integration
- ✅ M3U/M3U8 parser
- ✅ Xtream Codes API client
- ✅ Add Playlist modal UI
- ✅ Format auto-detection
- ✅ Test playlist with working streams
- ✅ Complete documentation

---

**Status**: ✅ **COMPLETE**
**Next**: Phase 5 - Advanced Features (EPG, Virtual Scrolling, Multiple Playlists)

---

Last Updated: 2025-01-08
