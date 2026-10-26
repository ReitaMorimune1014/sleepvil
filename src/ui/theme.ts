// 画面全体で使う色・文字・余白・角丸。値を変えるときはここだけを直す

export const colors = {
  background: '#fbf7ef',
  surface: '#ffffff',
  text: '#2b2b2b',
  textMuted: '#6b6b6b',
  border: '#ddd5c4',
  primary: '#3d7a4a',
  primaryPressed: '#30603a',
  onPrimary: '#ffffff',
  secondary: '#ece4d2',
  secondaryPressed: '#ddd3bc',
  accent: '#e0a458',
  selected: '#e3efe5',
} as const;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

/** 文字は大きめにする(要件第8章: 文字は大きく) */
export const fontSize = {
  caption: 14,
  body: 18,
  title: 24,
  hero: 30,
} as const;

export const radius = {
  m: 12,
  l: 20,
  pill: 999,
} as const;
