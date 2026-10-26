import { MIN_WAKES_FOR_REGULARITY } from '../config/regularity';
import { MINUTES_PER_DAY } from './time';

const HALF_DAY = MINUTES_PER_DAY / 2;

/**
 * 1週間分の起床時刻(0時からの経過分)から、規則性スコアを求める。
 * スコアは起床時刻の標準偏差(分)で、小さいほど規則的。
 * スキップした日・未達成の日は、呼び出し側で除いてから渡す。
 * 件数が足りない場合は null(画面では「なし」と表示する)。
 */
export function regularityScore(wakeMinutes: readonly number[]): number | null {
  if (wakeMinutes.length < MIN_WAKES_FOR_REGULARITY) {
    return null;
  }

  // 0時をまたいでもばらつきを正しく測れるよう、1件目を基準に並べ直す
  const base = wakeMinutes[0];
  const aligned = wakeMinutes.map((m) => alignNear(m, base));

  // 母標準偏差: 平均からの差の2乗を平均して、平方根をとる
  const mean = aligned.reduce((sum, m) => sum + m, 0) / aligned.length;
  const variance = aligned.reduce((sum, m) => sum + (m - mean) ** 2, 0) / aligned.length;
  return Math.sqrt(variance);
}

/**
 * 時刻 m を、基準 base から±12時間以内の値に置き換える。
 * 例: base が 23:50(1430)、m が 0:10(10)なら 1450 を返す(差は20分)
 */
function alignNear(m: number, base: number): number {
  let diff = (m - base) % MINUTES_PER_DAY;
  if (diff > HALF_DAY) {
    diff -= MINUTES_PER_DAY;
  }
  if (diff < -HALF_DAY) {
    diff += MINUTES_PER_DAY;
  }
  return base + diff;
}
