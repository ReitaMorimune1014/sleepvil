import type { DayRecord } from '../store/types';
import { summarizeWeek } from './weekSummary';

const success = (date: string, wakeMinutes: number): DayRecord => ({ date, kind: 'success', targetMinutes: 390, wakeMinutes });
const skip = (date: string): DayRecord => ({ date, kind: 'skip', targetMinutes: 390, ticketUsed: true });

describe('summarizeWeek', () => {
  test('月曜から日曜まで7日分を並べ、記録のない日は undefined', () => {
    const summary = summarizeWeek([success('2026-10-27', 390)], '2026-10-26');
    expect(summary.days.map((d) => d.date)).toEqual([
      '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01',
    ]);
    expect(summary.days[0].record).toBeUndefined();
    expect(summary.days[1].record?.kind).toBe('success');
  });

  test('規則性スコアは、その週の成功した日だけで計算する(スキップや他の週は含めない)', () => {
    const records = [
      success('2026-10-19', 600), // 前の週
      success('2026-10-27', 380),
      skip('2026-10-28'),
      success('2026-10-29', 400),
    ];
    expect(summarizeWeek(records, '2026-10-26').regularity).toBe(10);
  });

  test('成功が2日未満なら null', () => {
    expect(summarizeWeek([success('2026-10-27', 390)], '2026-10-26').regularity).toBeNull();
  });
});
