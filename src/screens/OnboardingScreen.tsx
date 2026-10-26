import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarcodeScanner } from '../components/BarcodeScanner';
import { formatMinutes, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import type { Barcode } from '../store/types';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Screen } from '../ui/Screen';
import { colors, spacing } from '../ui/theme';

type Step = 'time' | 'guide' | 'scan' | 'ifthen';

const STEP_NUMBER: Record<Step, number> = { time: 1, guide: 2, scan: 3, ifthen: 4 };
const DEFAULT_TARGET_MINUTES = 6 * 60 + 30;

/** 初回設定(F1): 起床時刻 → 置き場所の案内 → バーコード登録 → if-then文 */
export function OnboardingScreen() {
  const [step, setStep] = useState<Step>('time');
  const [targetMinutes, setTargetMinutes] = useState(DEFAULT_TARGET_MINUTES);
  const [barcode, setBarcode] = useState<Barcode | null>(null);
  // 撮り直すときに BarcodeScanner を作り直すための番号
  const [scanKey, setScanKey] = useState(0);

  const finish = async () => {
    if (!barcode) {
      return;
    }
    const { setTargetTime, registerBarcode, completeOnboarding } = useAppStore.getState();
    await setTargetTime(targetMinutes);
    registerBarcode(barcode);
    completeOnboarding();
  };

  const progress = <AppText variant="caption" center>{`ステップ ${STEP_NUMBER[step]} / 4`}</AppText>;

  if (step === 'scan' && !barcode) {
    return (
      <SafeAreaView style={styles.scanScreen} edges={['top', 'bottom']}>
        <BarcodeScanner key={scanKey} onScanned={setBarcode} />
        <View style={styles.scanFooter}>
          <AppText center>登録する物のバーコードを映してください</AppText>
          <AppButton title="戻る" variant="ghost" onPress={() => setStep('guide')} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'time') {
    // ピッカーは Date を扱うため、日付は使わず時刻だけを入れる
    const value = new Date(2000, 0, 1, Math.floor(targetMinutes / 60), targetMinutes % 60);
    return (
      <Screen center>
        {progress}
        <AppText variant="hero" center>毎朝、何時に起きますか?</AppText>
        <Card>
          <DateTimePicker
            mode="time"
            display="spinner"
            themeVariant="light"
            value={value}
            onValueChange={(_event, date) => setTargetMinutes(toMinutes(date))}
          />
        </Card>
        <AppButton title="次へ" onPress={() => setStep('guide')} />
      </Screen>
    );
  }

  if (step === 'guide') {
    return (
      <Screen center>
        {progress}
        <AppText variant="hero" center>止めるための物を選びます</AppText>
        <Card>
          <AppText>寝室から離れた場所にある、バーコード付きの物を選んでください。</AppText>
          <AppText variant="muted">例: 洗面所の歯磨き粉</AppText>
          <AppText>毎朝、そこまで歩いてスキャンします。</AppText>
        </Card>
        <AppButton title="カメラで登録する" onPress={() => setStep('scan')} />
        <AppButton title="戻る" variant="ghost" onPress={() => setStep('time')} />
      </Screen>
    );
  }

  if (step === 'scan' && barcode) {
    return (
      <Screen center>
        {progress}
        <AppText variant="hero" center>このバーコードを登録しますか?</AppText>
        <Card>
          <AppText variant="title" center>{barcode.data}</AppText>
        </Card>
        <AppButton title="これにする" onPress={() => setStep('ifthen')} />
        <AppButton
          title="撮り直す"
          variant="secondary"
          onPress={() => {
            setBarcode(null);
            setScanKey((k) => k + 1);
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen center>
      {progress}
      <AppText variant="hero" center>あなたの朝のルール</AppText>
      <Card style={styles.ruleCard}>
        <AppText variant="title" center>
          {formatMinutes(targetMinutes)}にアラームが鳴ったら、{'\n'}登録した物をスキャンしに行く
        </AppText>
      </Card>
      <AppButton title="はじめる" onPress={finish} />
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
  ruleCard: {
    backgroundColor: colors.selected,
    borderColor: colors.primary,
  },
});
