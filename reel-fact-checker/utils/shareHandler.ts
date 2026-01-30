/**
 * Extract Instagram reel URL from shared text
 */
export function extractInstagramUrl(text: string | null): string | null {
  if (!text) return null;

  // Match various Instagram URL patterns
  const patterns = [
    /https?:\/\/(?:www\.)?instagram\.com\/reel\/[\w-]+/i,
    /https?:\/\/(?:www\.)?instagram\.com\/p\/[\w-]+/i,
    /https?:\/\/(?:www\.)?instagram\.com\/reels\/[\w-]+/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Validate Instagram URL format
 */
export function isValidInstagramUrl(url: string): boolean {
  const pattern = /^https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|reels)\/[\w-]+/i;
  return pattern.test(url);
}

/**
 * Extract reel ID from Instagram URL
 */
export function extractReelId(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|p|reels)\/([\w-]+)/i);
  return match ? match[1] : null;
}
