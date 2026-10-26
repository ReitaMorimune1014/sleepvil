import { Button, StyleSheet, Text, View } from 'react-native';

import { getVillageProgress } from '../domain/era';
import { isWithinDeadline } from '../domain/mission';
import { formatMinutes, localDateKey, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import { selectTotalSuccessDays } from '../store/appStore';

type Props = {
  onStartMission: () => void;
};

/** ホーム画面。村の絵は M4 で作るため、今は時代と累計を文字で表示する */
export function HomeScreen({ onStartMission }: Props) {
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
  );
}

const styles = StyleSheet.create({
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
