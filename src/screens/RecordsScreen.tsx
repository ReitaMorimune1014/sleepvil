import { useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SleepinessPicker } from '../components/SleepinessPicker';
import { formatMinutes, localDateKey } from '../domain/time';
import { addDays, formatDayLabel, startOfWeek } from '../domain/week';
import { summarizeWeek } from '../domain/weekSummary';
import { useAppStore } from '../store';
import type { DayRecord } from '../store/types';

type Props = {
  onClose: () => void;
};

function describeRecord(record: DayRecord | undefined, isFuture: boolean): string {
  if (!record) {
    return isFuture ? '' : '記録なし';
  }
  if (record.kind === 'skip') {
    return record.ticketUsed ? 'お休み(チケット)' : 'お休み';
  }
  return `${formatMinutes(record.wakeMinutes)} 起床`;
}

/** 記録画面(F6): 1週間分の起床時刻、規則性スコア、眠気。前の週にもさかのぼれる */
export function RecordsScreen({ onClose }: Props) {
  const records = useAppStore((s) => s.records);
  const today = localDateKey(new Date());
  // 0 = 今週、-1 = 先週 …
  const [weekOffset, setWeekOffset] = useState(0);
  // 眠気を付け直すために開いている日
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const summary = summarizeWeek(records, weekStart);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>記録</Text>
      <View style={styles.weekNav}>
        <Button title="← 前の週" onPress={() => setWeekOffset((w) => w - 1)} />
        <Text style={styles.body}>{formatDayLabel(weekStart)}〜</Text>
        <Button title="次の週 →" disabled={weekOffset === 0} onPress={() => setWeekOffset((w) => w + 1)} />
      </View>

      <Text style={styles.regularity}>
        {summary.regularity === null
          ? '起床時刻のばらつき: 成功が2日以上あると表示します'
          : `起床時刻のばらつき: 約 ${Math.round(summary.regularity)} 分`}
      </Text>

      {summary.days.map(({ date, record }) => (
        <View key={date} style={styles.day}>
          <Pressable
            style={styles.dayRow}
            disabled={!record}
            onPress={() => setEditingDate(editingDate === date ? null : date)}
          >
            <Text style={styles.body}>{formatDayLabel(date)}</Text>
            <Text style={styles.body}>{describeRecord(record, date > today)}</Text>
            <Text style={styles.body}>{record?.sleepiness ? `眠気 ${record.sleepiness}` : record ? '眠気 −' : ''}</Text>
          </Pressable>
          {record && editingDate === date && (
            <SleepinessPicker
              value={record.sleepiness}
              onSelect={(value) => useAppStore.getState().setSleepiness(date, value)}
            />
          )}
        </View>
      ))}

      <Text style={styles.hint}>記録のある日をタップすると、眠気を付け直せます</Text>
      <Button title="ホームにもどる" onPress={onClose} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 64,
    gap: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regularity: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 8,
  },
  day: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    gap: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  body: {
    fontSize: 18,
  },
  hint: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
