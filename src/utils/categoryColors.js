// ============================================================
// DYNAMIC CATEGORY & IMAGE AUTO-COLOR SYSTEM
// Strict Palette: #8E793E, #AD974F, #231F20, #EAEAEA
// ============================================================

export const CATEGORY_PALETTES = {
  Technology: {
    name: 'Technology',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'EXECUTIVE TECH',
    icon: '',
  },
  Music: {
    name: 'Music',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'GOLD RHYTHM',
    icon: '',
  },
  Sports: {
    name: 'Sports',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'CHAMPIONSHIP',
    icon: '',
  },
  Business: {
    name: 'Business',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'EXECUTIVE PRO',
    icon: '',
  },
  Arts: {
    name: 'Arts',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'FINE ARTS',
    icon: '',
  },
  Workshops: {
    name: 'Workshops',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'MASTERCLASS',
    icon: '',
  },
  Networking: {
    name: 'Networking',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'CONNECTIONS',
    icon: '',
  },
  Entertainment: {
    name: 'Entertainment',
    primary: '#AD974F',
    secondary: '#8E793E',
    bgLight: '#231F20',
    badgeBg: 'rgba(173, 151, 79, 0.15)',
    badgeText: '#AD974F',
    border: 'rgba(173, 151, 79, 0.3)',
    hoverGlow: 'none',
    gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
    gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
    tag: 'LUXURY EXPERIENCE',
    icon: '',
  },
};

export const DEFAULT_PALETTE = {
  name: 'Default',
  primary: '#AD974F',
  secondary: '#8E793E',
  bgLight: '#231F20',
  badgeBg: 'rgba(173, 151, 79, 0.15)',
  badgeText: '#AD974F',
  border: 'rgba(173, 151, 79, 0.3)',
  hoverGlow: 'none',
  gradient: 'linear-gradient(135deg, #AD974F 0%, #8E793E 100%)',
  gradientSubtle: 'linear-gradient(135deg, rgba(173, 151, 79, 0.15) 0%, rgba(35, 31, 32, 0.9) 100%)',
  tag: 'EVENTPRO',
  icon: '',
};

export function getCategoryPalette(category) {
  if (!category) return DEFAULT_PALETTE;
  const key = Object.keys(CATEGORY_PALETTES).find(
    k => k.toLowerCase() === category.toLowerCase()
  );
  return CATEGORY_PALETTES[key] || DEFAULT_PALETTE;
}

export function extractDominantColorTheme(imageUrl, category) {
  return getCategoryPalette(category);
}
