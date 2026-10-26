import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, radius, spacing } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  /** primary: 一番大事な操作、secondary: 次に大事な操作、ghost: 目立たせない操作 */
  variant?: Variant;
  disabled?: boolean;
};

/** 大きく押しやすいボタン。標準の Button の代わりに使う */
export function AppButton({ title, onPress, variant = 'primary', disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && variantStyles[variant].pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variantStyles[variant].label]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryPressed },
    label: { color: colors.onPrimary },
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: colors.secondary },
    pressed: { backgroundColor: colors.secondaryPressed },
    label: { color: colors.text },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent', minHeight: 44 },
    pressed: { backgroundColor: colors.secondary },
    label: { color: colors.textMuted, fontWeight: 'normal' },
  }),
};
