import { evaluateScan, isSameBarcode, isWithinDeadline } from './mission';

const REGISTERED = { type: 'ean13', data: '4901234567890' };
// 6:30 = 390分、締め切りは 7:30 = 450分
const TARGET = 390;

describe('isSameBarcode', () => {
  test('中身が同じなら一致', () => {
    expect(isSameBarcode(REGISTERED, '4901234567890')).toBe(true);
  });

  test('中身が違えば不一致', () => {
    expect(isSameBarcode(REGISTERED, '4900000000000')).toBe(false);
  });
});

describe('isWithinDeadline', () => {
  test('目標時刻+60分ちょうどまでは締め切り内', () => {
    expect(isWithinDeadline(TARGET, 450)).toBe(true);
  });

  test('目標時刻+61分は締め切りを過ぎている', () => {
    expect(isWithinDeadline(TARGET, 451)).toBe(false);
  });

  test('目標より早い時刻は締め切り内(早起き)', () => {
    expect(isWithinDeadline(TARGET, 180)).toBe(true);
  });
});

describe('evaluateScan', () => {
  test('締め切り内で一致すれば success', () => {
    expect(evaluateScan(REGISTERED, '4901234567890', TARGET, 400)).toBe('success');
  });

  test('締め切り内で不一致なら wrong_code', () => {
    expect(evaluateScan(REGISTERED, '4900000000000', TARGET, 400)).toBe('wrong_code');
  });

  test('締め切りを過ぎたら、一致していても past_deadline', () => {
    expect(evaluateScan(REGISTERED, '4901234567890', TARGET, 451)).toBe('past_deadline');
    expect(evaluateScan(REGISTERED, '4900000000000', TARGET, 451)).toBe('past_deadline');
  });
});
