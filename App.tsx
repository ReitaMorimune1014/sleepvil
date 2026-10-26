import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { MissionScreen } from './src/screens/MissionScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useAppStore } from './src/store';

type Screen = 'home' | 'mission';

export default function App() {
  // 端末内の保存データを読み込み終わるまでは、何も表示しない
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());
  useEffect(() => useAppStore.persist.onFinishHydration(() => setHydrated(true)), []);

  const onboardingCompleted = useAppStore((s) => s.settings.onboardingCompleted);
  const [screen, setScreen] = useState<Screen>('home');

  if (!hydrated) {
    return <View style={styles.container} />;
  }

  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  return (
    <View style={styles.container}>
      {screen === 'home' ? (
        <HomeScreen onStartMission={() => setScreen('mission')} />
      ) : (
        <MissionScreen onClose={() => setScreen('home')} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
