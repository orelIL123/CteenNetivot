export const COLORS = {
  // ── Brand ──────────────────────────────────────────────
  gold: '#D4A54A',
  goldLight: '#E8C97A',
  goldDark: '#A87830',
  goldMuted: 'rgba(212,165,74,0.15)',

  // ── Sky / teal ─────────────────────────────────────────
  sky: '#3ABFCF',
  skyLight: '#6DD4E0',
  skyDark: '#1A9BAD',
  skyMuted: 'rgba(58,191,207,0.12)',

  // ── Neutrals (dark) ────────────────────────────────────
  ink: '#0F1118',          // deepest bg
  navy: '#141928',         // header bg
  navyMid: '#1E2740',      // card on dark
  navyLight: '#2A3553',    // border on dark

  // ── Neutrals (light) ──────────────────────────────────
  cream: '#FAF7F2',        // screen bg
  parchment: '#F3EDE1',    // card bg
  sand: '#E8DFD0',         // subtle bg / divider
  white: '#FFFFFF',

  // ── Text ──────────────────────────────────────────────
  textDark: '#0F1118',
  textMid: '#3A3A3A',
  textSoft: '#6B6B6B',
  textLight: '#9A9A9A',
  textOnDark: '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.65)',

  // ── Status ────────────────────────────────────────────
  green: '#2DA96B',
  greenLight: '#52C98B',
  greenMuted: 'rgba(45,169,107,0.12)',
  red: '#D9453B',
  redMuted: 'rgba(217,69,59,0.12)',
  blue: '#2A6FDB',
  blueMuted: 'rgba(42,111,219,0.12)',
  purple: '#7B5EA7',
  purpleMuted: 'rgba(123,94,167,0.12)',
  orange: '#E07840',
  orangeMuted: 'rgba(224,120,64,0.12)',

  // ── Legacy aliases (keep for backward compat) ─────────
  sand_legacy: '#E8A96A',
  sandDark: '#A87830',
  offWhite: '#FAF7F2',
  charcoal: '#141928',
  charcoalMid: '#1E2740',
  border: 'rgba(0,0,0,0.08)',
} as const;

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BORDER_RADIUS = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  gold: {
    shadowColor: '#D4A54A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const TYPOGRAPHY = {
  displayXL: { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -0.5 },
  displayL: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.3 },
  displayM: { fontSize: 26, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.2 },
  headingL: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
  headingM: { fontSize: 18, fontWeight: '700' as const, lineHeight: 26 },
  headingS: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22 },
  bodyL: { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  bodyM: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodyS: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.0, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 15 },
} as const;
