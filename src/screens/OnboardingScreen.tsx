import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { BarcodeScanner } from '../components/BarcodeScanner';
import { formatMinutes, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import type { Barcode } from '../store/types';

type Step = 'time' | 'guide' | 'scan' | 'ifthen';

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

  if (step === 'time') {
    // ピッカーは Date を扱うため、日付は使わず時刻だけを入れる
    const value = new Date(2000, 0, 1, Math.floor(targetMinutes / 60), targetMinutes % 60);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>毎朝、何時に起きますか?</Text>
        <DateTimePicker
          mode="time"
          display="spinner"
          value={value}
          onValueChange={(_event, date) => setTargetMinutes(toMinutes(date))}
        />
        <Button title="次へ" onPress={() => setStep('guide')} />
      </View>
    );
  }

  if (step === 'guide') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>止めるためのバーコードを選びます</Text>
        <Text style={styles.body}>
          寝室から離れた場所にある物を選んでください。{'\n'}例: 洗面所の歯磨き粉
        </Text>
        <Text style={styles.body}>毎朝、そこまで歩いてスキャンします。</Text>
        <Button title="カメラで登録する" onPress={() => setStep('scan')} />
      </View>
    );
  }

  if (step === 'scan') {
    if (!barcode) {
      return <BarcodeScanner key={scanKey} onScanned={setBarcode} />;
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>このバーコードを登録しますか?</Text>
        <Text style={styles.body}>{barcode.data}</Text>
        <Button title="これにする" onPress={() => setStep('ifthen')} />
        <Button
          title="撮り直す"
          onPress={() => {
            setBarcode(null);
            setScanKey((k) => k + 1);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>あなたの朝のルール</Text>
      <Text style={styles.rule}>
        {formatMinutes(targetMinutes)}にアラームが鳴ったら、{'\n'}登録した物をスキャンしに行く
      </Text>
      <Button title="はじめる" onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: {
    fontSize: 20,
    textAlign: 'center',
  },
  rule: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 36,
  },
});
