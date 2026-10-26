import { ON_TIME_POINTS, ON_TIME_WINDOW_MINUTES, OTHER_SUCCESS_POINTS } from '../config/points';

const MINUTES_PER_DAY = 24 * 60;

/** 成功した起床の記録。時刻はいずれも0時からの経過分(例: 6:30 → 390) */
export type SuccessfulWake = {
  targetMinutes: number;
  wakeMinutes: number;
};

/**
 * 目標時刻と起床時刻の差(分)。0時をまたぐ場合は近いほうの差を使う。
 * 例: 目標 0:10、起床 23:55 → 15分
 */
export function wakeDifferenceMinutes(targetMinutes: number, wakeMinutes: number): number {
  const diff = Math.abs(wakeMinutes - targetMinutes) % MINUTES_PER_DAY;
  return Math.min(diff, MINUTES_PER_DAY - diff);
}

/**
 * 1回の成功で加算する日数。
 * 成功かどうか(締め切り時刻)の判定は呼び出し側で済ませている前提。
 */
export function pointsForWake(targetMinutes: number, wakeMinutes: number): number {
  return wakeDifferenceMinutes(targetMinutes, wakeMinutes) <= ON_TIME_WINDOW_MINUTES
    ? ON_TIME_POINTS
    : OTHER_SUCCESS_POINTS;
}

/** 成功記録の一覧から、累計成功日数を求める */
export function totalSuccessDays(wakes: readonly SuccessfulWake[]): number {
  return wakes.reduce((sum, w) => sum + pointsForWake(w.targetMinutes, w.wakeMinutes), 0);
}
