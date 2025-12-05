/**
 * Utility functions for cleaning and validating URLs
 */

/**
 * Clean and validate a URL string
 * Removes surrounding quotes, whitespace, and ensures proper protocol
 */
export function cleanUrl(url: string): string {
  if (!url) return '';
  
  // Remove any surrounding quotes or whitespace
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  
  // Ensure it's a valid URL with protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  
  return cleaned;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://demo.ever.works");

/**
 * Get the base URL for API calls with proper cleaning
 */
export function getBaseUrl(): string {  
  return cleanUrl(appUrl);
}

/**
 * Construct a full URL from a path
 */
export function buildUrl(path: string, baseUrl?: string): string {
  const base = baseUrl ? cleanUrl(baseUrl) : getBaseUrl();
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${base}${cleanPath}`;
}
