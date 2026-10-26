import { localDateKey } from './time';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

/** YYYY-MM-DD を、端末ローカルのその日の0時の Date にする */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 日付を n 日ずらす(n が負なら前の日) */
export function addDays(key: string, n: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + n);
  return localDateKey(date);
}

/** その日を含む週の月曜日 */
export function startOfWeek(key: string): string {
  // getDay は日曜=0〜土曜=6。月曜からの日数に直す(月曜=0〜日曜=6)
  const daysSinceMonday = (parseDateKey(key).getDay() + 6) % 7;
  return addDays(key, -daysSinceMonday);
}

/** 月曜から日曜までの7日分 */
export function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/** 表示用のラベル。例: "10/27(火)" */
export function formatDayLabel(key: string): string {
  const date = parseDateKey(key);
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAY_LABELS[date.getDay()]})`;
}
