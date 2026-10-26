import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { BarcodeScanner } from '../components/BarcodeScanner';
import { evaluateScan, type ScanResult } from '../domain/mission';
import { pointsForWake } from '../domain/points';
import { localDateKey, toMinutes } from '../domain/time';
import { useAppStore } from '../store';
import type { Barcode } from '../store/types';

type Props = {
  onClose: () => void;
};

/** 起床ミッション(F2): 登録したバーコードをスキャンして完了する */
export function MissionScreen({ onClose }: Props) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [points, setPoints] = useState(0);
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
      recordSuccess(localDateKey(now), nowMinutes);
      setPoints(pointsForWake(settings.targetMinutes, nowMinutes));
    }
    setResult(judged);
  };

  if (result === null) {
    return (
      <View style={styles.scanContainer}>
        <BarcodeScanner key={scanKey} onScanned={handleScanned} />
        <View style={styles.footer}>
          <Text style={styles.body}>登録した物のバーコードを映してください</Text>
          <Button title="戻る" onPress={onClose} />
        </View>
      </View>
    );
  }

  if (result === 'wrong_code') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>違うコードです</Text>
        <Text style={styles.body}>登録した物のバーコードを読み取ってください</Text>
        <Button
          title="もう一度スキャンする"
          onPress={() => {
            setResult(null);
            setScanKey((k) => k + 1);
          }}
        />
        <Button title="戻る" onPress={onClose} />
      </View>
    );
  }

  if (result === 'past_deadline') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>今日の締め切りを過ぎました</Text>
        <Text style={styles.body}>また明日、待っています</Text>
        <Button title="戻る" onPress={onClose} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>おはようございます!</Text>
      <Text style={styles.body}>村が {points} 日分 成長しました</Text>
      <Button title="村にもどる" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  scanContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body: {
    fontSize: 20,
    textAlign: 'center',
  },
});
