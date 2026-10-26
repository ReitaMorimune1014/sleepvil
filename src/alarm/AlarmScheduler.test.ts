import type { AlarmScheduler } from './AlarmScheduler';
import { FakeAlarmScheduler } from './FakeAlarmScheduler';
import { NoopAlarmScheduler } from './NoopAlarmScheduler';

describe('NoopAlarmScheduler', () => {
  test('予約・取り消しを呼んでもエラーにならない', async () => {
    const scheduler: AlarmScheduler = new NoopAlarmScheduler();
    await expect(scheduler.schedule(390)).resolves.toBeUndefined();
    await expect(scheduler.cancelAll()).resolves.toBeUndefined();
  });
});

describe('FakeAlarmScheduler', () => {
  test('最初は予約がない', () => {
    expect(new FakeAlarmScheduler().scheduledMinutes).toBeNull();
  });

  test('予約すると目標時刻が記録され、再予約で置き換わる', async () => {
    const scheduler = new FakeAlarmScheduler();
    await scheduler.schedule(390);
    await scheduler.schedule(420);
    expect(scheduler.scheduledMinutes).toBe(420);
  });

  test('取り消すと予約がなくなり、操作の順序が履歴に残る', async () => {
    const scheduler = new FakeAlarmScheduler();
    await scheduler.schedule(390);
    await scheduler.cancelAll();
    expect(scheduler.scheduledMinutes).toBeNull();
    expect(scheduler.calls).toEqual(['schedule:390', 'cancelAll']);
  });
});
