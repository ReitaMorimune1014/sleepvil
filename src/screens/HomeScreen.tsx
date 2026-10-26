import { useEffect, useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BUILDING_STAGES_PER_ERA, ERAS } from '../config/village';
import { getVillageProgress } from '../domain/era';
import { isWithinDeadline } from '../domain/mission';
import { currentStreak, guiltLevel, missedDaysInRow } from '../domain/streak';
import { formatMinutes, localDateKey, toMinutes } from '../domain/time';
import { addDays } from '../domain/week';
import { useAppStore } from '../store';
import { selectTotalSuccessDays } from '../store/appStore';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Screen } from '../ui/Screen';
import { colors, spacing } from '../ui/theme';
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
  const guilt = guiltLevel(missedDaysInRow(records, today));
  // 開発中だけ: 各時代の最終段階を見比べるための表示の上書き(保存はしない)
  const [previewEra, setPreviewEra] = useState<number | null>(null);

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
    // 起きなかった日が続いていたら、責めずに「待っていた」ことだけを伝える
    status = guilt === 'none' ? 'おはようございます' : '待ってたよ';
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
      {/* 村は画面の一番上(ステータスバーの裏)から描き、空がつながって見えるようにする */}
      <Village
        width={width}
        height={height * 0.42}
        eraIndex={previewEra ?? progress.eraIndex}
        buildingStage={previewEra !== null ? BUILDING_STAGES_PER_ERA : progress.buildingStage}
        guilt={guilt}
        celebrate={celebrate}
        onCelebrated={onCelebrated}
      />
      <Screen scroll edges={['bottom']}>
        <Card>
          <AppText variant="title" center>
            {progress.eraName}の村(段階 {progress.buildingStage})
          </AppText>
          <View style={styles.stats}>
            <Stat label="累計" value={`${totalDays}日`} />
            <Stat label="連続" value={`${streak}日`} />
            <Stat label="お休みチケット" value={`${tickets}枚`} />
          </View>
          <AppText variant="caption" center>
            起床時刻 {targetMinutes !== null ? formatMinutes(targetMinutes) : '未設定'}
          </AppText>
        </Card>
        <AppText variant="title" center>
          {status}
        </AppText>
        {canStart && <AppButton title="ミッション開始" onPress={onStartMission} />}
        {canSkip && <AppButton title="今日はスキップ" variant="secondary" onPress={confirmSkip} />}
        <AppButton title="記録を見る" variant="ghost" onPress={onOpenRecords} />
        {/* __DEV__ は開発中(Expo Goなど)だけ true。公開版には表示されない */}
        {__DEV__ && (
          <View style={styles.devArea}>
            <AppButton title="設定をやり直す(開発用)" variant="ghost" onPress={() => useAppStore.getState().resetAll()} />
            {/* 4日前に成功した記録を作り、その後3日起きなかった状態にする(見た目の変化の確認用) */}
            <AppButton
              title="3日休んだ状態にする(開発用)"
              variant="ghost"
              onPress={() => {
                if (targetMinutes !== null) {
                  useAppStore.getState().recordSuccess(addDays(today, -4), targetMinutes);
                }
              }}
            />
            <AppButton
              title={previewEra === null ? '時代を見比べる(開発用)' : `次の時代へ(開発用・今は${ERAS[previewEra].name})`}
              variant="ghost"
              onPress={() => setPreviewEra((e) => (e === null ? 0 : e + 1 < ERAS.length ? e + 1 : null))}
            />
          </View>
        )}
      </Screen>
    </View>
  );
}

/** 数字を大きく、項目名を小さく並べる */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  devArea: {
    marginTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.s,
  },
});
