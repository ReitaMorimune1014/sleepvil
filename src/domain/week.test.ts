import { addDays, formatDayLabel, startOfWeek, weekDays } from './week';

// 2026-10-26 は月曜日、2026-11-01 は日曜日
describe('addDays', () => {
  test('月や年をまたいでずらせる', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });
});

describe('startOfWeek', () => {
  test('月曜はその日、日曜は6日前の月曜', () => {
    expect(startOfWeek('2026-10-26')).toBe('2026-10-26');
    expect(startOfWeek('2026-10-29')).toBe('2026-10-26');
    expect(startOfWeek('2026-11-01')).toBe('2026-10-26');
  });

  test('年をまたぐ週', () => {
    expect(startOfWeek('2027-01-03')).toBe('2026-12-28');
  });
});

describe('weekDays', () => {
  test('月曜から日曜までの7日', () => {
    const days = weekDays('2026-10-26');
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-10-26');
    expect(days[6]).toBe('2026-11-01');
  });
});

describe('formatDayLabel', () => {
  test('月/日(曜日)', () => {
    expect(formatDayLabel('2026-10-27')).toBe('10/27(火)');
  });
});
