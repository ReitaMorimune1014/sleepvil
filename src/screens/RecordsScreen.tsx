import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SleepinessPicker } from '../components/SleepinessPicker';
import { formatMinutes, localDateKey } from '../domain/time';
import { addDays, formatDayLabel, startOfWeek } from '../domain/week';
import { summarizeWeek } from '../domain/weekSummary';
import { useAppStore } from '../store';
import type { DayRecord } from '../store/types';
import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Screen } from '../ui/Screen';
import { colors, spacing } from '../ui/theme';

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
    <Screen scroll>
      <AppText variant="hero" center>
        記録
      </AppText>
      <View style={styles.weekNav}>
        <View style={styles.navButton}>
          <AppButton title="← 前の週" variant="secondary" onPress={() => setWeekOffset((w) => w - 1)} />
        </View>
        <AppText>{formatDayLabel(weekStart)}〜</AppText>
        <View style={styles.navButton}>
          <AppButton
            title="次の週 →"
            variant="secondary"
            disabled={weekOffset === 0}
            onPress={() => setWeekOffset((w) => w + 1)}
          />
        </View>
      </View>

      <Card>
        <AppText variant="caption" center>
          起床時刻のばらつき
        </AppText>
        {summary.regularity === null ? (
          <AppText variant="muted" center>
            成功が2日以上あると表示します
          </AppText>
        ) : (
          <AppText variant="title" center>
            約 {Math.round(summary.regularity)} 分
          </AppText>
        )}
      </Card>

      <Card>
        {summary.days.map(({ date, record }, i) => (
          <View key={date} style={[styles.day, i > 0 && styles.dayDivider]}>
            <Pressable
              style={({ pressed }) => [styles.dayRow, pressed && styles.pressed]}
              disabled={!record}
              onPress={() => setEditingDate(editingDate === date ? null : date)}
              accessibilityRole={record ? 'button' : undefined}
            >
              <AppText style={styles.dateCell}>{formatDayLabel(date)}</AppText>
              <AppText style={styles.recordCell}>{describeRecord(record, date > today)}</AppText>
              <AppText variant="caption">
                {record?.sleepiness ? `眠気 ${record.sleepiness}` : record ? '眠気 −' : ''}
              </AppText>
            </Pressable>
            {record && editingDate === date && (
              <SleepinessPicker
                value={record.sleepiness}
                onSelect={(value) => useAppStore.getState().setSleepiness(date, value)}
              />
            )}
          </View>
        ))}
      </Card>

      <AppText variant="caption" center>
        記録のある日をタップすると、眠気を付け直せます
      </AppText>
      <AppButton title="ホームにもどる" variant="ghost" onPress={onClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.s,
  },
  navButton: {
    flex: 1,
  },
  day: {
    paddingVertical: spacing.s,
    gap: spacing.s,
  },
  dayDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  pressed: {
    opacity: 0.6,
  },
  dateCell: {
    width: 96,
  },
  recordCell: {
    flex: 1,
  },
});
