/**
 * Design System Color Tokens
 */

export const dark = {
  bg: {
    primary: '#0A0A12',
    secondary: '#12121E',
    surface: '#181828',
    elevated: '#1F1F32',
    input: '#1A1A2C',
  },
  border: {
    default: '#252540',
    subtle: '#1C1C30',
    focus: '#7C6FF7',
  },
  primary: {
    DEFAULT: '#7C6FF7',
    light: '#A89DF9',
    dark: '#5A4FCC',
    bg: '#1A1635',
  },
  success: {
    DEFAULT: '#34D399',
    light: '#6EE7B7',
    dark: '#059669',
    bg: '#0D2A1F',
  },
  warning: {
    DEFAULT: '#FBBF24',
    light: '#FCD34D',
    dark: '#D97706',
    bg: '#2A1F06',
  },
  danger: {
    DEFAULT: '#F87171',
    light: '#FCA5A5',
    dark: '#DC2626',
    bg: '#2A0D0D',
  },
  info: {
    DEFAULT: '#60A5FA',
    light: '#93C5FD',
    dark: '#2563EB',
    bg: '#0D1A2A',
  },
  text: {
    primary: '#F0F0FA',
    secondary: '#9090B0',
    muted: '#555575',
    inverse: '#0A0A12',
    link: '#A89DF9',
  },
  tab: {
    active: '#7C6FF7',
    inactive: '#555575',
    bg: '#0E0E1C',
    border: '#1C1C30',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gradient: {
    primary: ['#7C6FF7', '#5A4FCC'] as [string, string],
    success: ['#34D399', '#059669'] as [string, string],
    danger: ['#F87171', '#DC2626'] as [string, string],
    card: ['#1F1F32', '#181828'] as [string, string],
  },
};

export const light: typeof dark = {
  bg: {
    primary: '#F9FAFB',
    secondary: '#F3F4F6',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    input: '#F3F4F6',
  },
  border: {
    default: '#E5E7EB',
    subtle: '#F3F4F6',
    focus: '#7C6FF7',
  },
  primary: { ...dark.primary, bg: '#F1F0FF' },
  success: { ...dark.success, bg: '#ECFDF5' },
  warning: { ...dark.warning, bg: '#FFFBEB' },
  danger: { ...dark.danger, bg: '#FEF2F2' },
  info: { ...dark.info, bg: '#EFF6FF' },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
    link: '#7C6FF7',
  },
  tab: {
    active: '#7C6FF7',
    inactive: '#9CA3AF',
    bg: '#FFFFFF',
    border: '#E5E7EB',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gradient: {
    primary: ['#A89DF9', '#7C6FF7'] as [string, string],
    success: ['#6EE7B7', '#34D399'] as [string, string],
    danger: ['#FCA5A5', '#F87171'] as [string, string],
    card: ['#FFFFFF', '#F9FAFB'] as [string, string],
  },
};

export type ThemeColors = typeof dark;

// Fallback constant for unmigrated components (prevents app break while refactoring)
export const Colors = dark;
export type ColorKey = keyof typeof Colors;
