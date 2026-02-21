export const COLORS = {
  bgPrimary: '#000000',
  bgSecondary: '#0a0a0f',
  bgCard: '#0d0d14',
  bgCardHover: '#14141e',
  bgGlass: 'rgba(8,8,18,0.75)',
  textPrimary: '#f0f0f5',
  textSecondary: '#8e8ea0',
  textMuted: '#555566',
  accent: '#0066ff',
  accentLight: '#4d94ff',
  accentDark: '#0044cc',
  accentGlow: 'rgba(0,102,255,0.25)',
  scoreHigh: '#00e676',
  scoreMid: '#ffab40',
  scoreLow: '#ff5252',
  border: '#141422',
  borderLight: '#1e1e30',
  overlay: 'rgba(0,0,0,0.85)',
  gold: '#FFD700',
  goldDark: '#B8860B',
  cyan: '#00e5ff',
  pink: '#ff6090',
  teal: '#1de9b6',
};

export const GRADIENTS = {
  accent: ['#0066ff', '#4d94ff'],
  accentAlt: ['#0066ff', '#0099ff'],
  accentVert: ['#0066ff', '#0044cc'],
  gold: ['#FFD700', '#FFA500'],
  dark: ['#0d0d14', '#000000'],
  scoreHigh: ['#00e676', '#00c853'],
  scoreMid: ['#ffab40', '#ff9100'],
  scoreLow: ['#ff5252', '#d50000'],
  glass: ['rgba(8,8,18,0.85)', 'rgba(8,8,18,0.5)'],
  hero: ['rgba(0,102,255,0.12)', 'rgba(0,102,255,0.02)'],
  cardShine: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'],
  nightSky: ['#000000', '#060612', '#000000'],
  scanGlow: ['rgba(0,102,255,0.4)', 'rgba(0,102,255,0)'],
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.textPrimary },
  bold: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textMuted },
  score: { fontSize: 48, fontWeight: '800', color: COLORS.textPrimary },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  accentGlow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const GLASS = {
  card: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
};

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
