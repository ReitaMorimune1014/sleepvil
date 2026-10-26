/** 1日の分数。時刻は「0時からの経過分」で扱う */
export const MINUTES_PER_DAY = 24 * 60;

/** 端末のローカル時刻を「0時からの経過分」にする(秒は切り捨て)。例: 6:30 → 390 */
export function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** 端末のローカル日付を YYYY-MM-DD にする(記録の日付に使う) */
export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 「0時からの経過分」を H:MM 形式の文字列にする。例: 390 → "6:30" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}
