/**
 * Design System Color Tokens
 * Dark-first palette with a deep indigo accent
 */
export const Colors = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  bg: {
    primary: '#0A0A12',   // Main app background
    secondary: '#12121E', // Secondary background, drawer
    surface: '#181828',   // Cards, sheets
    elevated: '#1F1F32',  // Modals, dropdowns
    input: '#1A1A2C',     // Input fields
  },

  // ─── Borders ────────────────────────────────────────────────────────────────
  border: {
    default: '#252540',
    subtle: '#1C1C30',
    focus: '#7C6FF7',
  },

  // ─── Brand / Primary ─────────────────────────────────────────────────────────
  primary: {
    DEFAULT: '#7C6FF7',   // Indigo/violet
    light: '#A89DF9',
    dark: '#5A4FCC',
    bg: '#1A1635',        // Tinted bg for primary elements
  },

  // ─── Semantic Colors ─────────────────────────────────────────────────────────
  success: {
    DEFAULT: '#34D399',   // Green (barang masuk)
    light: '#6EE7B7',
    dark: '#059669',
    bg: '#0D2A1F',
  },
  warning: {
    DEFAULT: '#FBBF24',   // Amber (stok kritis)
    light: '#FCD34D',
    dark: '#D97706',
    bg: '#2A1F06',
  },
  danger: {
    DEFAULT: '#F87171',   // Red (barang keluar, danger)
    light: '#FCA5A5',
    dark: '#DC2626',
    bg: '#2A0D0D',
  },
  info: {
    DEFAULT: '#60A5FA',   // Blue
    light: '#93C5FD',
    dark: '#2563EB',
    bg: '#0D1A2A',
  },

  // ─── Text ────────────────────────────────────────────────────────────────────
  text: {
    primary: '#F0F0FA',
    secondary: '#9090B0',
    muted: '#555575',
    inverse: '#0A0A12',
    link: '#A89DF9',
  },

  // ─── Tabs & Icons ─────────────────────────────────────────────────────────────
  tab: {
    active: '#7C6FF7',
    inactive: '#555575',
    bg: '#0E0E1C',
    border: '#1C1C30',
  },

  // ─── Misc ─────────────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // ─── Gradients ────────────────────────────────────────────────────────────────
  gradient: {
    primary: ['#7C6FF7', '#5A4FCC'] as [string, string],
    success: ['#34D399', '#059669'] as [string, string],
    danger: ['#F87171', '#DC2626'] as [string, string],
    card: ['#1F1F32', '#181828'] as [string, string],
  },
};

export type ColorKey = keyof typeof Colors;
