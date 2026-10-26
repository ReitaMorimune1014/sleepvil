import { regularityScore } from './regularity';

describe('regularityScore', () => {
  test('記録が0件・1件なら null(なし)', () => {
    expect(regularityScore([])).toBeNull();
    expect(regularityScore([390])).toBeNull();
  });

  test('毎日同じ時刻なら0', () => {
    expect(regularityScore([390, 390, 390, 390])).toBe(0);
  });

  test('6:20 と 6:40 なら10分(平均6:30からの差)', () => {
    expect(regularityScore([380, 400])).toBe(10);
  });

  test('ばらつきが大きいほどスコアが大きい', () => {
    const steady = regularityScore([385, 390, 395])!;
    const unsteady = regularityScore([360, 390, 420])!;
    expect(unsteady).toBeGreaterThan(steady);
  });

  test('並び順に左右されない', () => {
    expect(regularityScore([360, 390, 420])).toBeCloseTo(regularityScore([420, 360, 390])!);
  });

  test('0時をまたいでも近い時刻として扱う(23:50 と 0:10 → 10分)', () => {
    expect(regularityScore([23 * 60 + 50, 10])).toBe(10);
    expect(regularityScore([10, 23 * 60 + 50])).toBe(10);
  });
});
