import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarcodeScanner } from '../components/BarcodeScanner';
import { SleepinessPicker } from '../components/SleepinessPicker';
import { evaluateScan, type ScanResult } from '../domain/mission';
import { pointsForWake } from '../domain/points';
import { localDateKey, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import type { Barcode } from '../store/types';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Screen } from '../ui/Screen';
import { colors, spacing } from '../ui/theme';

type Props = {
  /** ホームに戻る。succeeded はミッションに成功したかどうか */
  onClose: (succeeded: boolean) => void;
};

/** 起床ミッション(F2): 登録したバーコードをスキャンして完了する */
export function MissionScreen({ onClose }: Props) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [points, setPoints] = useState(0);
  // 成功を記録した日。眠気をその日の記録に付けるために使う
  const [successDate, setSuccessDate] = useState<string | null>(null);
  const sleepiness = useAppStore((s) => s.records.find((r) => r.date === successDate)?.sleepiness);
  // 違うコードだったときに、スキャナーを作り直してもう一度読むための番号
  const [scanKey, setScanKey] = useState(0);

  const handleScanned = (scanned: Barcode) => {
    const { settings, recordSuccess } = useAppStore.getState();
    if (!settings.barcode || settings.targetMinutes === null) {
      return;
    }
    const now = new Date();
    const nowMinutes = toMinutes(now);
    const judged = evaluateScan(settings.barcode, scanned.data, settings.targetMinutes, nowMinutes);
    if (judged === 'success') {
      const date = localDateKey(now);
      recordSuccess(date, nowMinutes);
      setSuccessDate(date);
      setPoints(pointsForWake(settings.targetMinutes, nowMinutes));
    }
    setResult(judged);
  };

  if (result === null) {
    return (
      <SafeAreaView style={styles.scanScreen} edges={['top', 'bottom']}>
        <BarcodeScanner key={scanKey} onScanned={handleScanned} />
        <View style={styles.scanFooter}>
          <AppText center>登録した物のバーコードを映してください</AppText>
          <AppButton title="戻る" variant="ghost" onPress={() => onClose(false)} />
        </View>
      </SafeAreaView>
    );
  }

  if (result === 'wrong_code') {
    return (
      <Screen center>
        <AppText variant="hero" center>違うコードです</AppText>
        <AppText variant="muted" center>登録した物のバーコードを読み取ってください</AppText>
        <AppButton
          title="もう一度スキャンする"
          onPress={() => {
            setResult(null);
            setScanKey((k) => k + 1);
          }}
        />
        <AppButton title="戻る" variant="ghost" onPress={() => onClose(false)} />
      </Screen>
    );
  }

  if (result === 'past_deadline') {
    return (
      <Screen center>
        <AppText variant="hero" center>今日の締め切りを過ぎました</AppText>
        <AppText variant="muted" center>また明日、待っています</AppText>
        <AppButton title="村にもどる" variant="secondary" onPress={() => onClose(false)} />
      </Screen>
    );
  }

  return (
    <Screen center>
      <AppText variant="hero" center>おはようございます!</AppText>
      <Card style={styles.successCard}>
        <AppText variant="title" center>村が {points} 日分 成長しました</AppText>
      </Card>
      <Card>
        <AppText center>今の眠気は?</AppText>
        <AppText variant="caption" center>選ばなくても大丈夫です</AppText>
        <SleepinessPicker
          value={sleepiness}
          onSelect={(value) => successDate && useAppStore.getState().setSleepiness(successDate, value)}
        />
      </Card>
      <AppButton title="村にもどる" onPress={() => onClose(true)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scanScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scanFooter: {
    padding: spacing.l,
    gap: spacing.s,
  },
  successCard: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
});
