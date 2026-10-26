import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors, fontSize } from './theme';

type Variant = 'hero' | 'title' | 'body' | 'muted' | 'caption';

type Props = {
  children: ReactNode;
  variant?: Variant;
  center?: boolean;
  style?: TextStyle;
};

/** テーマの文字の大きさと色をそろえたテキスト */
export function AppText({ children, variant = 'body', center = false, style }: Props) {
  return <Text style={[styles[variant], center && styles.center, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  hero: { fontSize: fontSize.hero, fontWeight: 'bold', color: colors.text },
  title: { fontSize: fontSize.title, fontWeight: 'bold', color: colors.text },
  body: { fontSize: fontSize.body, color: colors.text, lineHeight: 26 },
  muted: { fontSize: fontSize.body, color: colors.textMuted, lineHeight: 26 },
  caption: { fontSize: fontSize.caption, color: colors.textMuted },
  center: { textAlign: 'center' },
});
