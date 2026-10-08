import { useColorScheme } from 'react-native';

export const FONT = {
  title: 'Fraunces_600SemiBold',
  body: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
} as const;


export type Theme = {
  isDark: boolean;
  primary: string;
  primaryEdge: string;
  onPrimary: string;
  background: string;
  text: string;
  textSoft: string;
  placeholder: string;
  line: string;
  fieldBg: string;
  secondaryFace: string;
  secondaryEdge: string;
  error: string;
  errorTint: string;
};

const PRIMARY = '#2A9DC3';
const PRIMARY_EDGE = '#1F7A98';

const light: Theme = {
  isDark: false,
  primary: PRIMARY,
  primaryEdge: PRIMARY_EDGE,
  onPrimary: '#FFFFFF',
  background: '#f1f5f8',
  text: '#2B2B2B',
  textSoft: '#5A5A5A',
  placeholder: '#8C8C8C',
  line: '#E0E0E0',
  fieldBg: '#F7F7F7',
  secondaryFace: '#FFFFFF',
  secondaryEdge: '#E0E0E0',
  error: '#C62828',
  errorTint: '#FDECEA',
};

const dark: Theme = {
  isDark: true,
  primary: PRIMARY,
  primaryEdge: PRIMARY_EDGE,
  onPrimary: '#FFFFFF',
  background: '#111c20',
  text: '#F1F7FB',
  textSoft: '#AFC0C8',
  placeholder: '#7C8E97',
  line: '#37464F',
  fieldBg: '#202F36',
  secondaryFace: '#202F36',
  secondaryEdge: '#37464F',
  error: '#FF8A80',
  errorTint: '#3B1F1F',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

export function darken(hex: string, amount = 0.22): string {
  const [r, g, b] = parseHex(hex);
  const k = 1 - amount;
  return `#${toHex(r * k)}${toHex(g * k)}${toHex(b * k)}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha * 255)}`;
}