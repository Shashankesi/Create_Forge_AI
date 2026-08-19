/**
 * Centralized Aspect Ratio Configuration for CreateForge AI
 * Single source of truth for all supported image aspect ratios, dimensions, and provider mappings.
 */

const ASPECT_RATIO_DIMENSIONS = {
  '1:1': '1024x1024',
  '16:9': '1536x864',
  '9:16': '864x1536',
  '4:3': '1152x864',
  '3:4': '864x1152',
  '3:2': '1536x1024',
};

const SUPPORTED_ASPECT_RATIOS = {
  '1:1': {
    id: 'square',
    label: '1:1 Square',
    ratio: '1:1',
    size: '1024x1024',
    width: 1024,
    height: 1024,
    description: 'Instagram & Profile Posts',
    icon: 'square',
  },
  '16:9': {
    id: 'landscape',
    label: '16:9 Landscape',
    ratio: '16:9',
    size: '1536x864',
    width: 1536,
    height: 864,
    description: 'YouTube, Web Banners & Article Covers',
    icon: 'rectangle-horizontal',
  },
  '9:16': {
    id: 'portrait',
    label: '9:16 Portrait',
    ratio: '9:16',
    size: '864x1536',
    width: 864,
    height: 1536,
    description: 'Stories, Reels & Mobile Wallpapers',
    icon: 'rectangle-vertical',
  },
  '4:3': {
    id: 'standard',
    label: '4:3 Standard',
    ratio: '4:3',
    size: '1152x864',
    width: 1152,
    height: 864,
    description: 'Classic Presentations & Displays',
    icon: 'tv',
  },
  '3:4': {
    id: 'classicPortrait',
    label: '3:4 Portrait',
    ratio: '3:4',
    size: '864x1152',
    width: 864,
    height: 1152,
    description: 'Portraits & Editorial Layouts',
    icon: 'book-open',
  },
  '3:2': {
    id: 'photo',
    label: '3:2 Photo',
    ratio: '3:2',
    size: '1536x1024',
    width: 1536,
    height: 1024,
    description: '35mm Classic Photography',
    icon: 'camera',
  },
};

const VALID_ASPECT_RATIO_VALUES = Object.keys(SUPPORTED_ASPECT_RATIOS);

/**
 * Checks if an aspect ratio string is officially supported
 * @param {string} inputRatio
 * @returns {boolean}
 */
const isValidAspectRatio = (inputRatio) => {
  if (!inputRatio || typeof inputRatio !== 'string') return false;
  return Boolean(SUPPORTED_ASPECT_RATIOS[inputRatio.trim()]);
};

/**
 * Normalizes input aspect ratio to a supported ratio
 * @param {string} inputRatio
 * @returns {string} Safe supported ratio (defaults to '1:1')
 */
const normalizeAspectRatio = (inputRatio) => {
  if (!inputRatio || typeof inputRatio !== 'string') return '1:1';
  const clean = inputRatio.trim();
  if (SUPPORTED_ASPECT_RATIOS[clean]) {
    return clean;
  }
  // Try matching with underscore, slash or dash
  const standardFormat = clean.replace(/[_/x-]/g, ':');
  if (SUPPORTED_ASPECT_RATIOS[standardFormat]) {
    return standardFormat;
  }
  return '1:1';
};

/**
 * Get pixel dimensions for a given aspect ratio
 * @param {string} ratio
 * @returns {{ width: number, height: number, size: string }}
 */
const getDimensionsForRatio = (ratio) => {
  const normalized = normalizeAspectRatio(ratio);
  const config = SUPPORTED_ASPECT_RATIOS[normalized];
  return {
    width: config.width,
    height: config.height,
    size: config.size || ASPECT_RATIO_DIMENSIONS[normalized] || '1024x1024',
  };
};

/**
 * Get size string (e.g. "1536x864") for API endpoints
 * @param {string} ratio
 * @returns {string}
 */
const getSizeStringForRatio = (ratio) => {
  const normalized = normalizeAspectRatio(ratio);
  return ASPECT_RATIO_DIMENSIONS[normalized] || '1024x1024';
};

module.exports = {
  ASPECT_RATIO_DIMENSIONS,
  SUPPORTED_ASPECT_RATIOS,
  VALID_ASPECT_RATIO_VALUES,
  isValidAspectRatio,
  normalizeAspectRatio,
  getDimensionsForRatio,
  getSizeStringForRatio,
};
