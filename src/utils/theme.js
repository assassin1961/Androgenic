// ─── Color System ───────────────────────────────────────────────────
// Premium ultra-minimalist dark aesthetic
export const COLORS = {
  // Backgrounds — pure blacks for OLED
  bgPrimary: '#000000',
  bgSecondary: '#0A0A0A',
  bgTertiary: '#141414',
  bgCard: '#1A1A1A',
  bgCardHover: '#222222',
  bgElevated: '#1A1A1A',

  // Glass surfaces — translucent overlays for BlurView
  bgGlass: 'rgba(10,10,10,0.55)',
  bgGlassLight: 'rgba(255,255,255,0.03)',
  bgGlassMid: 'rgba(20,20,20,0.45)',
  bgGlassHeavy: 'rgba(0,0,0,0.85)',
  bgGlassAccent: 'rgba(212,175,55,0.08)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textTertiary: '#666666',
  textMuted: '#444444',
  textGold: '#D4AF37',

  // Brand — classic gold
  accent: '#D4AF37',
  accentLight: '#FFD700',
  accentDark: '#B8960F',
  accentNeon: '#FFD700',
  accentGlow: 'rgba(212,175,55,0.35)',
  accentGlowSoft: 'rgba(212,175,55,0.15)',

  // Score colors (Madden-style rating system)
  scoreExcellent: '#34C759',   // 8-10
  scoreGood: '#4A90D9',        // 6-7.9
  scoreAverage: '#FF9500',     // 4-5.9
  scoreBelow: '#FF3B30',       // 0-3.9
  // Legacy aliases
  scoreHigh: '#34C759',
  scoreMid: '#FF9500',
  scoreLow: '#FF3B30',

  // Accent palette
  blue: '#4A90D9',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',

  // Borders
  border: '#1F1F1F',
  borderLight: '#2A2A2A',
  borderAccent: 'rgba(212,175,55,0.30)',
  borderGlow: 'rgba(212,175,55,0.45)',
  divider: '#1A1A1A',

  // Overlays
  overlay: 'rgba(0,0,0,0.85)',
  overlayLight: 'rgba(0,0,0,0.5)',

  // Premium accents
  gold: '#D4AF37',
  goldDark: '#B8960F',
  goldBright: '#FFD700',
  cyan: '#00e5ff',
  pink: '#ff6090',
  teal: '#1de9b6',
  purple: '#a855f7',
  violet: '#7c3aed',

  // Status
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#4A90D9',
};

// ─── Gradients ──────────────────────────────────────────────────────
export const GRADIENTS = {
  // Gold/premium gradients
  gold: ['#D4AF37', '#FFD700', '#D4AF37'],
  goldShine: ['#D4AF37', '#FFD700', '#D4AF37'],
  accent: ['#D4AF37', '#FFD700'],
  accentAlt: ['#D4AF37', '#B8960F'],
  accentVert: ['#D4AF37', '#B8960F'],
  accentNeon: ['#D4AF37', '#FFD700', '#D4AF37'],

  // Dark gradients
  dark: ['#000000', '#0A0A0A', '#000000'],
  card: ['#1A1A1A', '#141414'],
  score: ['#1A1A1A', '#111111'],

  // Score gradients
  scoreHigh: ['#34C759', '#2DA44E'],
  scoreMid: ['#FF9500', '#E68600'],
  scoreLow: ['#FF3B30', '#D63027'],
  scoreExcellent: ['#34C759', '#2DA44E'],
  scoreGood: ['#4A90D9', '#3A7BC8'],
  scoreAverage: ['#FF9500', '#E68600'],
  scoreBelow: ['#FF3B30', '#D63027'],

  // Glass gradients — translucent overlays for cards
  glass: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],
  glassDark: ['rgba(20,20,20,0.6)', 'rgba(10,10,10,0.4)'],
  glassAccent: ['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.03)'],
  glassGold: ['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.03)'],
  glassPremium: ['rgba(212,175,55,0.20)', 'rgba(212,175,55,0.05)'],

  // Surface gradients
  hero: ['rgba(212,175,55,0.15)', 'rgba(212,175,55,0.02)'],
  cardShine: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'],
  nightSky: ['#000000', '#0A0A0A', '#000000'],
  scanGlow: ['rgba(212,175,55,0.4)', 'rgba(212,175,55,0)'],

  // Mood gradients (full backgrounds)
  ambientBlue: ['#000000', '#0A1520', '#000000'],
  ambientPurple: ['#000000', '#120A1A', '#000000'],
  ambientGold: ['#000000', '#1A1400', '#000000'],
};

// ─── Typography ─────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  scoreXL: { fontSize: 72, fontWeight: '800' },
  scoreL: { fontSize: 48, fontWeight: '700' },
  scoreM: { fontSize: 32, fontWeight: '700' },
  h1: { fontSize: 28, fontWeight: '700' },
  h2: { fontSize: 22, fontWeight: '600' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  small: { fontSize: 11, fontWeight: '400' },
};

// Legacy FONTS export for backwards compatibility
export const FONTS = {
  regular: { fontSize: 15, color: COLORS.textPrimary },
  bold: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.3 },
  subtitle: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
  caption: { fontSize: 13, color: COLORS.textTertiary },
  score: { fontSize: 72, fontWeight: '800', color: COLORS.textPrimary },
};

// ─── Shadows ────────────────────────────────────────────────────────
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  glow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  accentGlow: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ─── Glass System ───────────────────────────────────────────────────
export const GLASS = {
  card: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardLight: {
    backgroundColor: COLORS.bgGlassLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardHeavy: {
    backgroundColor: COLORS.bgGlassHeavy,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardAccent: {
    backgroundColor: COLORS.bgGlassAccent,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  pill: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 999,
  },
  surface: {
    backgroundColor: COLORS.bgGlassMid,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
};

export const BLUR = {
  light: 20,
  medium: 40,
  heavy: 60,
  ultra: 80,
};

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── Score Colors (for reference) ──────────────────────────────────
export const SCORE_COLORS = {
  excellent: '#34C759',  // 8-10
  good: '#4A90D9',       // 6-7.9
  average: '#FF9500',    // 4-5.9
  below: '#FF3B30',      // 0-3.9
};

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Returns the appropriate color for a score value (0-10 scale).
 * - 8-10: excellent (green)
 * - 6-7.9: good (blue)
 * - 4-5.9: average (orange)
 * - 0-3.9: below average (red)
 */
export const getScoreColor = (score) => {
  if (score >= 8) return COLORS.scoreExcellent;
  if (score >= 6) return COLORS.scoreGood;
  if (score >= 4) return COLORS.scoreAverage;
  return COLORS.scoreBelow;
};

/**
 * Returns a descriptive label for a score value (0-10 scale).
 */
export const getScoreLabel = (score) => {
  if (score >= 8) return 'Model Tier';
  if (score >= 6) return 'Above Average';
  if (score >= 4) return 'Average';
  return 'Below Average';
};

/**
 * Returns the gradient array for a score value (0-10 scale).
 */
export const getScoreGradient = (score) => {
  if (score >= 8) return GRADIENTS.scoreExcellent;
  if (score >= 6) return GRADIENTS.scoreGood;
  if (score >= 4) return GRADIENTS.scoreAverage;
  return GRADIENTS.scoreBelow;
};
