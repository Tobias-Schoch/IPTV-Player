# Playlist Formats Guide

## Supported Formats

### 1. M3U / M3U8

**Standard IPTV playlist format** - Plain text file with channel information.

#### Example M3U File

```m3u
#EXTM3U

#EXTINF:-1 tvg-id="bbc1.uk" tvg-name="BBC One HD" tvg-logo="https://example.com/logos/bbc1.png" group-title="UK Channels",BBC One HD
https://example.com/streams/bbc1.m3u8

#EXTINF:-1 tvg-id="cnn.us" tvg-name="CNN International" tvg-logo="https://example.com/logos/cnn.png" group-title="News",CNN International
https://example.com/streams/cnn.m3u8

#EXTINF:-1 tvg-id="espn.us" tvg-name="ESPN HD" tvg-logo="https://example.com/logos/espn.png" group-title="Sports",ESPN HD
https://example.com/streams/espn.m3u8
```

#### Attributes

- `tvg-id` - Unique channel identifier (for EPG matching)
- `tvg-name` - Channel name (alternative name)
- `tvg-logo` - Channel logo URL
- `group-title` - Channel category/group
- `tvg-country` - Country code (e.g., UK, US)
- `tvg-language` - Language code (e.g., en, de, fr)

#### How to Add

1. Click "Add Playlist" button
2. Select "M3U / M3U8" tab
3. Enter playlist URL
4. Click "Add Playlist"

#### Example URLs

```
https://example.com/playlist.m3u
https://example.com/playlist.m3u8
https://pastebin.com/raw/ABC123
https://raw.githubusercontent.com/user/repo/main/playlist.m3u
```

---

### 2. Xtream Codes API

**API-based IPTV format** - Popular with IPTV providers and panels.

#### What is Xtream Codes?

Xtream Codes is a professional IPTV middleware/panel system used by many providers. Instead of a static M3U file, it provides a dynamic API that returns channels, categories, VOD, series, and EPG data.

#### How It Works

1. Provider gives you:
   - Server URL (e.g., `http://example.com:8080`)
   - Username
   - Password

2. API endpoints (automatically used):
   - `player_api.php?action=get_live_streams`
   - `player_api.php?action=get_live_categories`
   - `player_api.php?action=get_vod_streams`
   - `player_api.php?action=get_series`

#### How to Add

1. Click "Add Playlist" button
2. Select "Xtream Codes" tab
3. Enter server URL (without `/player_api.php`)
4. Enter username
5. Enter password
6. Click "Add Playlist"

#### Example Credentials

```
Server URL: http://example.com:8080
Username: your_username
Password: your_password
```

#### Stream URL Format

Channels are automatically formatted as:
```
http://example.com:8080/live/{username}/{password}/{stream_id}.{ext}
```

For example:
```
http://example.com:8080/live/john_doe/secret123/12345.m3u8
```

---

## Free Test Playlists

### Public M3U Test Streams

These are free, legal test streams you can use:

#### Big Buck Bunny (HLS)
```
#EXTM3U
#EXTINF:-1 tvg-logo="https://peach.blender.org/wp-content/uploads/bbb-splash.png" group-title="Demo",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

#### Tears of Steel (HLS)
```
#EXTM3U
#EXTINF:-1 tvg-logo="https://mango.blender.org/wp-content/uploads/2013/05/27_comp_000272.jpg" group-title="Demo",Tears of Steel
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
```

#### Sintel (HLS)
```
#EXTM3U
#EXTINF:-1 tvg-logo="https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.png" group-title="Demo",Sintel
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
```

### Create Test M3U File

Save this as `test_playlist.m3u`:

```m3u
#EXTM3U

#EXTINF:-1 tvg-id="bbb" tvg-name="Big Buck Bunny" tvg-logo="https://peach.blender.org/wp-content/uploads/bbb-splash.png" group-title="Demo",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8

#EXTINF:-1 tvg-id="tos" tvg-name="Tears of Steel" tvg-logo="https://mango.blender.org/wp-content/uploads/2013/05/27_comp_000272.jpg" group-title="Demo",Tears of Steel
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8

#EXTINF:-1 tvg-id="sintel" tvg-name="Sintel" tvg-logo="https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.png" group-title="Demo",Sintel
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8

#EXTINF:-1 tvg-id="apple_basic" tvg-name="Apple Basic" tvg-logo="https://www.apple.com/favicon.ico" group-title="Test",Apple Basic Stream
https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8

#EXTINF:-1 tvg-id="apple_advanced" tvg-name="Apple Advanced" tvg-logo="https://www.apple.com/favicon.ico" group-title="Test",Apple Advanced Stream
https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8
```

Upload to:
- GitHub Gist (public)
- Pastebin (raw link)
- Your own server

---

## Advanced M3U Features

### Custom HTTP Headers

```m3u
#EXTINF:-1 http-referrer="https://example.com" http-user-agent="CustomAgent/1.0" group-title="Custom",Channel with Headers
https://example.com/stream.m3u8
```

### Multiple Audio Tracks

```m3u
#EXTINF:-1 tvg-language="en,de,fr" group-title="Multilang",Multilingual Channel
https://example.com/stream.m3u8
```

### Country and Language

```m3u
#EXTINF:-1 tvg-country="UK" tvg-language="en" group-title="UK",BBC One
https://example.com/bbc1.m3u8
```

---

## Troubleshooting

### M3U Issues

**Problem**: "Invalid M3U format"
- **Solution**: Make sure file starts with `#EXTM3U`
- Check that each channel has `#EXTINF` line followed by URL

**Problem**: "Failed to fetch playlist"
- **Solution**: Check URL is accessible (try opening in browser)
- Make sure URL returns raw M3U content, not HTML page
- Check for CORS issues (use proxy if needed)

**Problem**: "Channels not showing logos"
- **Solution**: Check `tvg-logo` URLs are valid and accessible
- Use HTTPS URLs for logos
- Logos should be direct image links (PNG, JPG)

### Xtream Codes Issues

**Problem**: "Failed to authenticate"
- **Solution**: Double-check username and password
- Make sure server URL is correct (no trailing slash)
- Test credentials with provider

**Problem**: "No channels returned"
- **Solution**: Check your subscription is active
- Make sure account has live stream access
- Contact provider if issue persists

**Problem**: "Channels won't play"
- **Solution**: Check your IP is authorized (some providers restrict IPs)
- Try different stream format (TS vs M3U8)
- Check firewall/network restrictions

---

## Best Practices

### For M3U Playlists

1. **Use HTTPS URLs** - More secure and avoids mixed content issues
2. **Include TVG IDs** - Essential for EPG matching
3. **Organize with Groups** - Makes browsing easier
4. **Add Logos** - Improves visual experience
5. **Keep URLs Updated** - Streams can change, maintain playlist

### For Xtream Codes

1. **Secure Credentials** - Don't share username/password
2. **Use Strong Passwords** - Protect your account
3. **Monitor Usage** - Some providers have connection limits
4. **Keep Backup** - Export M3U if needed
5. **Contact Provider** - For issues with specific channels

---

## Converting Between Formats

### Xtream Codes → M3U

You can export Xtream playlists as M3U:

```
http://example.com:8080/get.php?username=USER&password=PASS&type=m3u_plus&output=ts
```

Parameters:
- `type=m3u_plus` - M3U with extra info
- `output=ts` or `output=m3u8` - Stream format

### M3U → Xtream Codes

Not directly possible - M3U is static, Xtream is dynamic API

---

## Security Notes

⚠️ **Important Security Considerations**

1. **Never share credentials publicly** - Username/password are personal
2. **Use HTTPS when possible** - Encrypts data in transit
3. **Be careful with free playlists** - May contain pirated content
4. **Verify provider legitimacy** - Use reputable IPTV services
5. **Respect copyright** - Only use legal streams

---

## Next Steps

- [Add your first playlist](../README.md#quick-start)
- [Configure EPG](./EPG_GUIDE.md) (coming soon)
- [Keyboard shortcuts](./KEYBOARD_SHORTCUTS.md) (coming soon)
- [Troubleshooting guide](./TROUBLESHOOTING.md) (coming soon)

---

Last Updated: 2025-01-08
