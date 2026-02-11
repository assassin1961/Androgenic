export const COLORS = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: '#1a1a1a',
  bgCardHover: '#222222',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  accent: '#6c5ce7',
  accentLight: '#a29bfe',
  accentDark: '#5a4bd1',
  scoreHigh: '#00d26a',
  scoreMid: '#f5a623',
  scoreLow: '#ff4757',
  border: '#2a2a2a',
  overlay: 'rgba(0,0,0,0.7)',
  gold: '#FFD700',
  goldDark: '#B8860B',
};

export const GRADIENTS = {
  accent: ['#6c5ce7', '#a29bfe'],
  accentAlt: ['#6c5ce7', '#fd79a8'],
  gold: ['#FFD700', '#FFA500'],
  dark: ['#1a1a1a', '#0a0a0a'],
  scoreHigh: ['#00d26a', '#00b894'],
  scoreMid: ['#f5a623', '#fdcb6e'],
  scoreLow: ['#ff4757', '#ee5a24'],
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
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
