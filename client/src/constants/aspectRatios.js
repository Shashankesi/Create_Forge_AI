/**
 * Centralized Aspect Ratio Configuration for CreateForge AI (Client)
 * Single source of truth for all supported image aspect ratios and dimensions.
 */

export const ASPECT_RATIO_DIMENSIONS = {
  '1:1': '1024x1024',
  '16:9': '1536x864',
  '9:16': '864x1536',
  '4:3': '1152x864',
  '3:4': '864x1152',
  '3:2': '1536x1024',
};

export const SUPPORTED_ASPECT_RATIOS = [
  {
    value: '1:1',
    label: '1:1 Square',
    description: 'Instagram & Posts',
    icon: '◻️',
    dimensions: '1024 × 1024',
  },
  {
    value: '16:9',
    label: '16:9 Landscape',
    description: 'Web Banners & Covers',
    icon: '🖥️',
    dimensions: '1536 × 864',
  },
  {
    value: '9:16',
    label: '9:16 Portrait',
    description: 'Reels & Stories',
    icon: '📱',
    dimensions: '864 × 1536',
  },
  {
    value: '4:3',
    label: '4:3 Standard',
    description: 'Displays & Decks',
    icon: '📺',
    dimensions: '1152 × 864',
  },
  {
    value: '3:4',
    label: '3:4 Portrait',
    description: 'Editorial & Prints',
    icon: '📄',
    dimensions: '864 × 1152',
  },
  {
    value: '3:2',
    label: '3:2 Photo',
    description: 'Classic Photography',
    icon: '📷',
    dimensions: '1536 × 1024',
  },
];

export const VALID_ASPECT_RATIO_VALUES = SUPPORTED_ASPECT_RATIOS.map((item) => item.value);

export const normalizeAspectRatio = (inputRatio) => {
  if (!inputRatio) return '1:1';
  const clean = inputRatio.trim();
  const match = SUPPORTED_ASPECT_RATIOS.find((item) => item.value === clean);
  return match ? match.value : '1:1';
};
