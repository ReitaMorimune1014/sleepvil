import { Button, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getVillageProgress } from '../domain/era';
import { isWithinDeadline } from '../domain/mission';
import { formatMinutes, localDateKey, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import { selectTotalSuccessDays } from '../store/appStore';
import { Village } from '../village/Village';

type Props = {
  onStartMission: () => void;
  /** ミッション成功の直後なら true。村人が集まって喜ぶ */
  celebrate: boolean;
  onCelebrated: () => void;
};

/** ホーム画面。上半分に村、下半分に時代・累計・今日の状態を表示する */
export function HomeScreen({ onStartMission, celebrate, onCelebrated }: Props) {
  const { width, height } = useWindowDimensions();
  const targetMinutes = useAppStore((s) => s.settings.targetMinutes);
  const records = useAppStore((s) => s.records);
  const totalDays = useAppStore(selectTotalSuccessDays);

  const now = new Date();
  const todayRecord = records.find((r) => r.date === localDateKey(now));
  const progress = getVillageProgress(totalDays);

  let status: string;
  let canStart = false;
  if (todayRecord?.kind === 'success') {
    status = '今日のミッションは達成済みです';
  } else if (todayRecord?.kind === 'skip') {
    status = '今日はお休みです';
  } else if (targetMinutes !== null && !isWithinDeadline(targetMinutes, toMinutes(now))) {
    status = '今日は記録なし。また明日';
  } else {
    status = 'おはようございます';
    canStart = true;
  }

  return (
    <View style={styles.screen}>
      <Village
        width={width}
        height={height * 0.45}
        eraIndex={progress.eraIndex}
        buildingStage={progress.buildingStage}
        celebrate={celebrate}
        onCelebrated={onCelebrated}
      />
      <View style={styles.container}>
        <Text style={styles.era}>
          {progress.eraName}の村(段階 {progress.buildingStage})
        </Text>
        <Text style={styles.body}>累計 {totalDays} 日</Text>
        <Text style={styles.body}>
          起床時刻 {targetMinutes !== null ? formatMinutes(targetMinutes) : '未設定'}
        </Text>
        <Text style={styles.status}>{status}</Text>
        {canStart && <Button title="ミッション開始" onPress={onStartMission} />}
        {/* __DEV__ は開発中(Expo Goなど)だけ true。公開版には表示されない */}
        {__DEV__ && (
          <View style={styles.devArea}>
            <Button title="設定をやり直す(開発用)" color="#888" onPress={() => useAppStore.getState().resetAll()} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  era: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 20,
  },
  status: {
    fontSize: 22,
    marginTop: 24,
    textAlign: 'center',
  },
  devArea: {
    marginTop: 48,
  },
});
