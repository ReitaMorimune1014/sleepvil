import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from './theme';

type Props = {
  children: ReactNode;
  /** 内容が画面に収まらないときにスクロールさせる */
  scroll?: boolean;
  /** 内容を縦方向の中央に寄せる */
  center?: boolean;
  /** ノッチやホームバーを避ける辺。既定は上下 */
  edges?: Edge[];
};

/** 画面の外枠。ノッチやホームバーに文字が重ならないよう、安全な範囲に内容を置く */
export function Screen({ children, scroll = false, center = false, edges = ['top', 'bottom'] }: Props) {
  const content = center ? styles.centerContent : styles.content;
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={content}>{children}</ScrollView>
      ) : (
        <View style={[styles.fill, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  content: {
    padding: spacing.l,
    gap: spacing.m,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.l,
    gap: spacing.l,
  },
});
