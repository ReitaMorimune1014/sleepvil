import { currentStreak, guiltLevel, missedDaysInRow, type StreakRecord } from './streak';

const success = (date: string): StreakRecord => ({ date, kind: 'success' });
const ticket = (date: string): StreakRecord => ({ date, kind: 'skip', ticketUsed: true });
const skip = (date: string): StreakRecord => ({ date, kind: 'skip', ticketUsed: false });

const TODAY = '2026-10-30';

describe('currentStreak', () => {
  test('記録がなければ0', () => {
    expect(currentStreak([], TODAY)).toBe(0);
  });

  test('今日まで連続で成功した日数', () => {
    expect(currentStreak([success('2026-10-28'), success('2026-10-29'), success(TODAY)], TODAY)).toBe(3);
  });

  test('今日がまだ記録されていなければ、昨日から数える', () => {
    expect(currentStreak([success('2026-10-28'), success('2026-10-29')], TODAY)).toBe(2);
  });

  test('チケットを使った日は、増えも途切れもしない', () => {
    expect(currentStreak([success('2026-10-27'), ticket('2026-10-28'), success('2026-10-29')], TODAY)).toBe(2);
  });

  test('記録のない日や、チケットなしのスキップで途切れる', () => {
    expect(currentStreak([success('2026-10-26'), success('2026-10-28'), success('2026-10-29')], TODAY)).toBe(2);
    expect(currentStreak([success('2026-10-28'), skip('2026-10-29')], TODAY)).toBe(0);
  });
});

describe('missedDaysInRow', () => {
  test('昨日から続く、起きなかった日の数', () => {
    expect(missedDaysInRow([success('2026-10-26')], TODAY)).toBe(3); // 27, 28, 29
  });

  test('チケットを使った日は数えずに飛ばす', () => {
    expect(missedDaysInRow([success('2026-10-26'), ticket('2026-10-28')], TODAY)).toBe(2);
  });

  test('チケットなしのスキップは、起きなかった日として数える', () => {
    expect(missedDaysInRow([success('2026-10-28'), skip('2026-10-29')], TODAY)).toBe(1);
  });

  test('今日成功していれば0(1回の成功で元に戻る)', () => {
    expect(missedDaysInRow([success('2026-10-26'), success(TODAY)], TODAY)).toBe(0);
  });

  test('使い始める前(最初の記録より前)は数えない', () => {
    expect(missedDaysInRow([skip('2026-10-29')], TODAY)).toBe(1);
    expect(missedDaysInRow([], TODAY)).toBe(0);
  });
});

describe('guiltLevel', () => {
  test('1日まではそのまま、2日でしおれ、3日で村人も待つ', () => {
    expect(guiltLevel(1)).toBe('none');
    expect(guiltLevel(2)).toBe('wilted');
    expect(guiltLevel(3)).toBe('waiting');
  });
});
