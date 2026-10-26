import { grantWeeklyTicket } from './tickets';

describe('grantWeeklyTicket', () => {
  test('まだ配っていなければ1枚配る', () => {
    expect(grantWeeklyTicket({ available: 0, lastGrantedWeek: null }, '2026-10-27')).toEqual({
      available: 1,
      lastGrantedWeek: '2026-10-26',
    });
  });

  test('同じ週なら、使ったあとでも配り直さない', () => {
    const state = { available: 0, lastGrantedWeek: '2026-10-26' };
    expect(grantWeeklyTicket(state, '2026-11-01')).toBe(state);
  });

  test('新しい週になったら配る', () => {
    expect(grantWeeklyTicket({ available: 0, lastGrantedWeek: '2026-10-26' }, '2026-11-02')).toEqual({
      available: 1,
      lastGrantedWeek: '2026-11-02',
    });
  });

  test('使わなかった分は繰り越さない(上限1枚)', () => {
    expect(grantWeeklyTicket({ available: 1, lastGrantedWeek: '2026-10-26' }, '2026-11-02').available).toBe(1);
  });
});
