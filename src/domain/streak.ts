import { WAIT_AFTER_MISSED_DAYS, WILT_AFTER_MISSED_DAYS } from '../config/guilt';
import { addDays } from './week';

/** 連続日数の計算に必要な、1日分の記録 */
export type StreakRecord = {
  date: string;
  kind: 'success' | 'skip';
  /** スキップでお休みチケットを使ったか */
  ticketUsed?: boolean;
};

type DayStatus = 'success' | 'ticket' | 'missed';

/** その日がどうだったか。記録がない日と、チケットなしのスキップは missed */
function statusOf(byDate: Map<string, StreakRecord>, date: string): DayStatus {
  const r = byDate.get(date);
  if (r?.kind === 'success') {
    return 'success';
  }
  if (r?.kind === 'skip' && r.ticketUsed) {
    return 'ticket';
  }
  return 'missed';
}

/** 最初の記録の日。これより前は使い始める前なので数えない */
function firstDate(records: readonly StreakRecord[]): string | null {
  return records.reduce<string | null>((min, r) => (min === null || r.date < min ? r.date : min), null);
}

/**
 * 連続日数(演出専用)。成功で1増え、チケットを使った日は増えも途切れもしない。
 * 今日がまだ記録されていなければ、昨日から数える(今日はまだ途切れていない)。
 */
export function currentStreak(records: readonly StreakRecord[], today: string): number {
  const first = firstDate(records);
  if (first === null) {
    return 0;
  }
  const byDate = new Map(records.map((r) => [r.date, r]));
  let date = byDate.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (date >= first) {
    const status = statusOf(byDate, date);
    if (status === 'missed') {
      break;
    }
    if (status === 'success') {
      streak += 1;
    }
    date = addDays(date, -1);
  }
  return streak;
}

/**
 * 起きなかった日が、昨日から何日続いているか。チケットを使った日は数えずに飛ばす。
 * 今日成功していれば0(1回の成功で元に戻る)。
 */
export function missedDaysInRow(records: readonly StreakRecord[], today: string): number {
  const first = firstDate(records);
  if (first === null) {
    return 0;
  }
  const byDate = new Map(records.map((r) => [r.date, r]));
  if (statusOf(byDate, today) === 'success') {
    return 0;
  }
  let date = addDays(today, -1);
  let missed = 0;
  while (date >= first) {
    const status = statusOf(byDate, date);
    if (status === 'success') {
      break;
    }
    if (status === 'missed') {
      missed += 1;
    }
    date = addDays(date, -1);
  }
  return missed;
}

/** 村の見た目の変化。none: 変化なし、wilted: 畑がしおれる、waiting: 村人も空を見上げて待つ */
export type GuiltLevel = 'none' | 'wilted' | 'waiting';

export function guiltLevel(missedDays: number): GuiltLevel {
  if (missedDays >= WAIT_AFTER_MISSED_DAYS) {
    return 'waiting';
  }
  if (missedDays >= WILT_AFTER_MISSED_DAYS) {
    return 'wilted';
  }
  return 'none';
}
