import { pointsForWake, totalSuccessDays, wakeDifferenceMinutes } from './points';

// 6:30 = 390分
const TARGET = 6 * 60 + 30;

describe('wakeDifferenceMinutes', () => {
  test('同じ時刻なら0分', () => {
    expect(wakeDifferenceMinutes(TARGET, TARGET)).toBe(0);
  });

  test('遅れても早くても、差は正の分数', () => {
    expect(wakeDifferenceMinutes(TARGET, TARGET + 20)).toBe(20);
    expect(wakeDifferenceMinutes(TARGET, TARGET - 20)).toBe(20);
  });

  test('0時をまたぐ場合は近いほうの差を使う', () => {
    // 目標 0:10、起床 23:55
    expect(wakeDifferenceMinutes(10, 23 * 60 + 55)).toBe(15);
    // 目標 23:50、起床 0:05
    expect(wakeDifferenceMinutes(23 * 60 + 50, 5)).toBe(15);
  });
});

describe('pointsForWake', () => {
  test('±15分ちょうどまでは1日分', () => {
    expect(pointsForWake(TARGET, TARGET)).toBe(1);
    expect(pointsForWake(TARGET, TARGET + 15)).toBe(1);
    expect(pointsForWake(TARGET, TARGET - 15)).toBe(1);
  });

  test('16分以上ずれたら0.5日分', () => {
    expect(pointsForWake(TARGET, TARGET + 16)).toBe(0.5);
  });

  test('早すぎる起床に追加報酬はない(0.5日分)', () => {
    expect(pointsForWake(TARGET, TARGET - 60)).toBe(0.5);
  });

  test('0時をまたいでも15分以内なら1日分', () => {
    expect(pointsForWake(10, 23 * 60 + 55)).toBe(1);
  });
});

describe('totalSuccessDays', () => {
  test('記録がなければ0日', () => {
    expect(totalSuccessDays([])).toBe(0);
  });

  test('1日分と0.5日分を合計する', () => {
    const wakes = [
      { targetMinutes: TARGET, wakeMinutes: TARGET },
      { targetMinutes: TARGET, wakeMinutes: TARGET + 10 },
      { targetMinutes: TARGET, wakeMinutes: TARGET + 40 },
    ];
    expect(totalSuccessDays(wakes)).toBe(2.5);
  });
});
