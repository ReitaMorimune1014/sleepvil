import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatMinutes } from './src/domain/time';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useAppStore } from './src/store';

export default function App() {
  // 端末内の保存データを読み込み終わるまでは、何も表示しない
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());
  useEffect(() => useAppStore.persist.onFinishHydration(() => setHydrated(true)), []);

  const settings = useAppStore((s) => s.settings);

  if (!hydrated) {
    return <View style={styles.container} />;
  }

  if (!settings.onboardingCompleted) {
    return <OnboardingScreen />;
  }

  // ホーム画面は M3-3 で作る。それまでは保存された設定を表示するだけ
  return (
    <View style={styles.container}>
      <Text style={styles.text}>起床時刻: {settings.targetMinutes !== null ? formatMinutes(settings.targetMinutes) : '未設定'}</Text>
      <Text style={styles.text}>バーコード: {settings.barcode?.data ?? '未登録'}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 20,
  },
});
