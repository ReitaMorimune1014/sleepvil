import { useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getVillageProgress } from '../domain/era';
import { isWithinDeadline } from '../domain/mission';
import { currentStreak } from '../domain/streak';
import { formatMinutes, localDateKey, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import { selectTotalSuccessDays } from '../store/appStore';
import { Village } from '../village/Village';

type Props = {
  onStartMission: () => void;
  onOpenRecords: () => void;
  /** ミッション成功の直後なら true。村人が集まって喜ぶ */
  celebrate: boolean;
  onCelebrated: () => void;
};

/** ホーム画面。上半分に村、下半分に時代・累計・今日の状態を表示する */
export function HomeScreen({ onStartMission, onOpenRecords, celebrate, onCelebrated }: Props) {
  const { width, height } = useWindowDimensions();
  const targetMinutes = useAppStore((s) => s.settings.targetMinutes);
  const records = useAppStore((s) => s.records);
  const tickets = useAppStore((s) => s.tickets.available);
  const totalDays = useAppStore(selectTotalSuccessDays);

  const now = new Date();
  const today = localDateKey(now);
  const todayRecord = records.find((r) => r.date === today);
  const progress = getVillageProgress(totalDays);
  const streak = currentStreak(records, today);

  // 開いたときに、新しい週ならお休みチケットを配る
  useEffect(() => {
    useAppStore.getState().grantTickets(today);
  }, [today]);

  let status: string;
  let canStart = false;
  if (todayRecord?.kind === 'success') {
    status = '今日のミッションは達成済みです';
  } else if (todayRecord?.kind === 'skip') {
    status = todayRecord.ticketUsed ? '今日はお休み(チケット使用)' : '今日はお休みです';
  } else if (targetMinutes !== null && !isWithinDeadline(targetMinutes, toMinutes(now))) {
    status = '今日は記録なし。また明日';
  } else {
    status = 'おはようございます';
    canStart = true;
  }
  // スキップは、その日の記録がまだなければいつでもできる(締め切り後も)
  const canSkip = !todayRecord && targetMinutes !== null;

  const confirmSkip = () => {
    const { recordSkip } = useAppStore.getState();
    if (tickets > 0) {
      Alert.alert('今日はスキップしますか?', 'お休みチケットを使うと、連続日数が途切れません。', [
        { text: 'チケットを使う', onPress: () => recordSkip(today, true) },
        { text: '使わずにスキップ', onPress: () => recordSkip(today, false) },
        { text: 'やめる', style: 'cancel' },
      ]);
    } else {
      Alert.alert('今日はスキップしますか?', '今週のお休みチケットは使用済みです。スキップすると、連続日数は0から数え直しになります。', [
        { text: 'スキップする', onPress: () => recordSkip(today, false) },
        { text: 'やめる', style: 'cancel' },
      ]);
    }
  };

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
        <Text style={styles.body}>
          累計 {totalDays} 日 / 連続 {streak} 日
        </Text>
        <Text style={styles.body}>
          起床 {targetMinutes !== null ? formatMinutes(targetMinutes) : '未設定'} / お休みチケット {tickets} 枚
        </Text>
        <Text style={styles.status}>{status}</Text>
        {canStart && <Button title="ミッション開始" onPress={onStartMission} />}
        {canSkip && <Button title="今日はスキップ" onPress={confirmSkip} />}
        <Button title="記録を見る" onPress={onOpenRecords} />
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
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  era: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 18,
  },
  status: {
    fontSize: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  devArea: {
    marginTop: 16,
  },
});
