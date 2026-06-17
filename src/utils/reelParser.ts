export function parseReelUrl(input: string): {
  embedUrl: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'other';
  rawIframe: boolean;
} {
  const trimmed = input.trim();
  
  // If it's empty
  if (!trimmed) {
    return { embedUrl: '', platform: 'other', rawIframe: false };
  }

  // If it contains an <iframe tag, extract the src attribute
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      const src = srcMatch[1];
      let platform: 'instagram' | 'facebook' | 'tiktok' | 'other' = 'other';
      if (src.includes('instagram.com')) platform = 'instagram';
      else if (src.includes('facebook.com')) platform = 'facebook';
      else if (src.includes('tiktok.com')) platform = 'tiktok';
      
      return {
        embedUrl: src,
        platform,
        rawIframe: true
      };
    }
  }

  // 1. Instagram Link Parsing
  // Support forms:
  // - https://www.instagram.com/reel/C_abcd123_XYZ/?igsh=...
  // - https://www.instagram.com/p/C_abcd123_XYZ/
  if (trimmed.includes('instagram.com/reel/') || trimmed.includes('instagram.com/p/')) {
    const match = trimmed.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/);
    if (match && match[2]) {
      const type = match[1];
      const reelId = match[2];
      return {
        embedUrl: `https://www.instagram.com/${type}/${reelId}/embed/`,
        platform: 'instagram',
        rawIframe: false
      };
    }
  }

  // 2. TikTok Link Parsing
  // Support forms:
  // - https://www.tiktok.com/@cooking_secrets/video/7374823948293
  // - https://www.tiktok.com/t/ZS23nks/
  if (trimmed.includes('tiktok.com')) {
    const videoIdMatch = trimmed.match(/\/video\/(\d+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return {
        embedUrl: `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`,
        platform: 'tiktok',
        rawIframe: false
      };
    }
  }

  // 3. Facebook Reel/Video Parsing
  // Support forms:
  // - https://www.facebook.com/reel/123456789
  // - https://www.facebook.com/watch/?v=123456789
  // - https://www.facebook.com/username/videos/123456789
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    if (trimmed.includes('/reel/')) {
      const match = trimmed.match(/\/reel\/(\d+)/);
      if (match && match[1]) {
        return {
          embedUrl: `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F${match[1]}%2F&show_text=0&t=0`,
          platform: 'facebook',
          rawIframe: false
        };
      }
    }
    const watchMatch = trimmed.match(/[?&]v=(\d+)/);
    if (watchMatch && watchMatch[1]) {
      return {
        embedUrl: `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${watchMatch[1]}%2F&show_text=0&t=0`,
        platform: 'facebook',
        rawIframe: false
      };
    }
    const videoMatch = trimmed.match(/\/videos\/(\d+)/);
    if (videoMatch && videoMatch[1]) {
      return {
        embedUrl: `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fvideos%2F${videoMatch[1]}%2F&show_text=0&t=0`,
        platform: 'facebook',
        rawIframe: false
      };
    }
    // Fallback URL encoding standard facebook post/video player
    return {
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&t=0`,
      platform: 'facebook',
      rawIframe: false
    };
  }

  // Return trimmed string as direct embed URL if no matches
  return {
    embedUrl: trimmed,
    platform: 'other',
    rawIframe: false
  };
}
