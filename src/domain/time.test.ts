import { formatMinutes, localDateKey, toMinutes } from './time';

// new Date(年, 月-1, 日, 時, 分) は端末のローカル時刻として作られる
describe('toMinutes', () => {
  test('ローカル時刻を0時からの経過分にする', () => {
    expect(toMinutes(new Date(2026, 9, 27, 6, 30))).toBe(390);
    expect(toMinutes(new Date(2026, 9, 27, 0, 0))).toBe(0);
    expect(toMinutes(new Date(2026, 9, 27, 23, 59))).toBe(1439);
  });

  test('秒は切り捨てる', () => {
    expect(toMinutes(new Date(2026, 9, 27, 6, 30, 59))).toBe(390);
  });
});

describe('localDateKey', () => {
  test('YYYY-MM-DD 形式で、月と日は2桁にそろえる', () => {
    expect(localDateKey(new Date(2026, 0, 5, 6, 30))).toBe('2026-01-05');
    expect(localDateKey(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});

describe('formatMinutes', () => {
  test('H:MM 形式にする', () => {
    expect(formatMinutes(390)).toBe('6:30');
    expect(formatMinutes(5)).toBe('0:05');
    expect(formatMinutes(1439)).toBe('23:59');
  });
});
