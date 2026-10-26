import type { DayRecord } from '../store/types';
import { regularityScore } from './regularity';
import { weekDays } from './week';

export type WeekSummary = {
  /** 月曜から日曜までの7日分。記録がない日は record が undefined */
  days: { date: string; record: DayRecord | undefined }[];
  /** その週の規則性スコア(分)。成功が2日未満なら null */
  regularity: number | null;
};

/** 記録画面に出す1週間分のまとめ。規則性スコアは成功した日の起床時刻だけで計算する */
export function summarizeWeek(records: readonly DayRecord[], weekStart: string): WeekSummary {
  const byDate = new Map(records.map((r) => [r.date, r]));
  const days = weekDays(weekStart).map((date) => ({ date, record: byDate.get(date) }));
  const wakeMinutes = days.flatMap(({ record }) => (record?.kind === 'success' ? [record.wakeMinutes] : []));
  return { days, regularity: regularityScore(wakeMinutes) };
}
