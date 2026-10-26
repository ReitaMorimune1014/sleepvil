import type { StateStorage } from 'zustand/middleware';

import { FakeAlarmScheduler } from '../alarm/FakeAlarmScheduler';
import { createAppStore, selectTotalSuccessDays } from './appStore';

/** テスト用の保存先(メモリ上) */
function memoryStorage(): StateStorage {
  const data = new Map<string, string>();
  return {
    getItem: (name) => data.get(name) ?? null,
    setItem: (name, value) => {
      data.set(name, value);
    },
    removeItem: (name) => {
      data.delete(name);
    },
  };
}

function setup() {
  const storage = memoryStorage();
  const alarm = new FakeAlarmScheduler();
  const store = createAppStore(storage, alarm);
  return { storage, alarm, store };
}

describe('appStore', () => {
  test('目標時刻を設定すると、アラームの予約も呼ばれる', async () => {
    const { store, alarm } = setup();
    await store.getState().setTargetTime(390);
    expect(store.getState().settings.targetMinutes).toBe(390);
    expect(alarm.scheduledMinutes).toBe(390);
  });

  test('目標時刻が未設定なら、記録できない', () => {
    const { store } = setup();
    expect(store.getState().recordSuccess('2026-10-27', 390)).toBe(false);
    expect(store.getState().records).toEqual([]);
  });

  test('成功を記録すると、その日の目標時刻と一緒に残る', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    expect(store.getState().recordSuccess('2026-10-27', 395)).toBe(true);
    expect(store.getState().records).toEqual([
      { date: '2026-10-27', kind: 'success', targetMinutes: 390, wakeMinutes: 395 },
    ]);
  });

  test('1日1件。成功のあとにスキップしても、成功が残る', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().recordSuccess('2026-10-27', 395);
    expect(store.getState().recordSkip('2026-10-27')).toBe(false);
    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().records[0].kind).toBe('success');
  });

  test('眠気は記録済みの日にだけ付けられる', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().recordSkip('2026-10-27');
    expect(store.getState().setSleepiness('2026-10-27', 4)).toBe(true);
    expect(store.getState().setSleepiness('2026-10-28', 2)).toBe(false);
    expect(store.getState().records[0].sleepiness).toBe(4);
  });

  test('累計成功日数は、成功の記録だけから計算する', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().recordSuccess('2026-10-27', 390); // 1日分
    store.getState().recordSuccess('2026-10-28', 450); // 0.5日分
    store.getState().recordSkip('2026-10-29'); // 数えない
    expect(selectTotalSuccessDays(store.getState())).toBe(1.5);
  });

  test('resetAll で設定と記録が消え、アラームも取り消される', async () => {
    const { store, alarm } = setup();
    await store.getState().setTargetTime(390);
    store.getState().completeOnboarding();
    store.getState().recordSuccess('2026-10-27', 395);

    await store.getState().resetAll();
    expect(store.getState().settings).toEqual({ targetMinutes: null, barcode: null, onboardingCompleted: false });
    expect(store.getState().records).toEqual([]);
    expect(alarm.scheduledMinutes).toBeNull();
  });

  test('保存したデータは、作り直したストアで読み込める', async () => {
    const { store, storage } = setup();
    await store.getState().setTargetTime(390);
    store.getState().registerBarcode({ type: 'ean13', data: '4901234567890' });
    store.getState().recordSuccess('2026-10-27', 395);

    const reopened = createAppStore(storage, new FakeAlarmScheduler());
    await reopened.persist.rehydrate();
    expect(reopened.getState().settings.barcode).toEqual({ type: 'ean13', data: '4901234567890' });
    expect(reopened.getState().records).toHaveLength(1);
  });
});
