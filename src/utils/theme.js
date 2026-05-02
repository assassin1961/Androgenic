// ─── Color System ───────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds — true blacks with subtle blue tint for OLED
  bgPrimary: '#000000',
  bgSecondary: '#050510',
  bgTertiary: '#0a0a18',
  bgCard: '#0d0d1a',
  bgCardHover: '#14141f',
  bgElevated: '#11111e',

  // Glass surfaces — translucent overlays for BlurView
  bgGlass: 'rgba(10,10,24,0.55)',
  bgGlassLight: 'rgba(255,255,255,0.04)',
  bgGlassMid: 'rgba(20,20,40,0.45)',
  bgGlassHeavy: 'rgba(8,8,16,0.85)',
  bgGlassAccent: 'rgba(0,102,255,0.10)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a8a8b8',
  textTertiary: '#6a6a7a',
  textMuted: '#4a4a5a',

  // Brand — electric blue
  accent: '#0066ff',
  accentLight: '#4d94ff',
  accentDark: '#0044cc',
  accentNeon: '#00aaff',
  accentGlow: 'rgba(0,102,255,0.35)',
  accentGlowSoft: 'rgba(0,102,255,0.15)',

  // Score colors
  scoreHigh: '#00e676',
  scoreMid: '#ffab40',
  scoreLow: '#ff5252',

  // Borders
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.10)',
  borderAccent: 'rgba(0,102,255,0.30)',
  borderGlow: 'rgba(0,170,255,0.45)',

  // Overlays
  overlay: 'rgba(0,0,0,0.85)',
  overlayLight: 'rgba(0,0,0,0.5)',

  // Premium accents
  gold: '#FFD700',
  goldDark: '#B8860B',
  cyan: '#00e5ff',
  pink: '#ff6090',
  teal: '#1de9b6',
  purple: '#a855f7',
  violet: '#7c3aed',

  // Status
  success: '#00e676',
  warning: '#ffab40',
  error: '#ff5252',
  info: '#0066ff',
};

// ─── Gradients ──────────────────────────────────────────────────────
export const GRADIENTS = {
  accent: ['#0066ff', '#4d94ff'],
  accentAlt: ['#0066ff', '#0099ff'],
  accentVert: ['#0066ff', '#0044cc'],
  accentNeon: ['#0066ff', '#00aaff', '#4d94ff'],
  gold: ['#FFD700', '#FFA500'],
  goldShine: ['#FFD700', '#FFA500', '#FFD700'],
  dark: ['#0d0d1a', '#000000'],
  scoreHigh: ['#00e676', '#00c853'],
  scoreMid: ['#ffab40', '#ff9100'],
  scoreLow: ['#ff5252', '#d50000'],

  // Glass gradients — translucent overlays for cards
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  glassDark: ['rgba(20,20,40,0.6)', 'rgba(10,10,24,0.4)'],
  glassAccent: ['rgba(0,102,255,0.15)', 'rgba(0,102,255,0.04)'],
  glassGold: ['rgba(255,215,0,0.15)', 'rgba(255,215,0,0.03)'],
  glassPremium: ['rgba(0,102,255,0.20)', 'rgba(168,85,247,0.10)'],

  // Surface gradients
  hero: ['rgba(0,102,255,0.18)', 'rgba(0,102,255,0.02)'],
  cardShine: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'],
  nightSky: ['#000000', '#060612', '#000000'],
  scanGlow: ['rgba(0,102,255,0.4)', 'rgba(0,102,255,0)'],

  // Mood gradients (full backgrounds)
  ambientBlue: ['#000000', '#001833', '#000000'],
  ambientPurple: ['#000000', '#1a0033', '#000000'],
  ambientGold: ['#000000', '#1a1400', '#000000'],
};

// ─── Typography ─────────────────────────────────────────────────────
export const FONTS = {
  regular: { fontSize: 14, color: '#ffffff' },
  bold: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#a8a8b8' },
  caption: { fontSize: 12, color: '#6a6a7a' },
  score: { fontSize: 48, fontWeight: '900', color: '#ffffff' },
};

// ─── Shadows ────────────────────────────────────────────────────────
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: {
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  accentGlow: {
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  },
};

// ─── Glass System ───────────────────────────────────────────────────
// Apply on top of <BlurView> for the full glass effect.
// Use BLUR_INTENSITY to control blur amount.
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

// ─── Helpers ────────────────────────────────────────────────────────
export const getScoreColor = (score) => {
  if (score >= 70) return COLORS.scoreHigh;
  if (score >= 40) return COLORS.scoreMid;
  return COLORS.scoreLow;
};

export const getScoreLabel = (score) => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Mid';
  return 'Low';
};

export const getScoreGradient = (score) => {
  if (score >= 70) return GRADIENTS.scoreHigh;
  if (score >= 40) return GRADIENTS.scoreMid;
  return GRADIENTS.scoreLow;
};
