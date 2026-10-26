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
    expect(store.getState().recordSkip('2026-10-27', false)).toBe(false);
    expect(store.getState().records).toHaveLength(1);
    expect(store.getState().records[0].kind).toBe('success');
  });

  test('眠気は記録済みの日にだけ付けられる', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().recordSkip('2026-10-27', false);
    expect(store.getState().setSleepiness('2026-10-27', 4)).toBe(true);
    expect(store.getState().setSleepiness('2026-10-28', 2)).toBe(false);
    expect(store.getState().records[0].sleepiness).toBe(4);
  });

  test('累計成功日数は、成功の記録だけから計算する', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().recordSuccess('2026-10-27', 390); // 1日分
    store.getState().recordSuccess('2026-10-28', 450); // 0.5日分
    store.getState().recordSkip('2026-10-29', false); // 数えない
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

describe('お休みチケット', () => {
  test('週に1回配られ、同じ週には配り直されない', () => {
    const { store } = setup();
    store.getState().grantTickets('2026-10-27');
    expect(store.getState().tickets).toEqual({ available: 1, lastGrantedWeek: '2026-10-26' });
  });

  test('チケットを使ってスキップすると1枚減り、記録に残る', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().grantTickets('2026-10-27');
    expect(store.getState().recordSkip('2026-10-27', true)).toBe(true);
    expect(store.getState().tickets.available).toBe(0);
    expect(store.getState().records[0]).toMatchObject({ kind: 'skip', ticketUsed: true });
  });

  test('チケットがなければ、チケットを使うスキップはできないが、使わないスキップはできる', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    expect(store.getState().recordSkip('2026-10-27', true)).toBe(false);
    expect(store.getState().recordSkip('2026-10-27', false)).toBe(true);
    expect(store.getState().records[0]).toMatchObject({ kind: 'skip', ticketUsed: false });
  });

  test('その日に記録済みなら、チケットは減らない', async () => {
    const { store } = setup();
    await store.getState().setTargetTime(390);
    store.getState().grantTickets('2026-10-27');
    store.getState().recordSuccess('2026-10-27', 390);
    expect(store.getState().recordSkip('2026-10-27', true)).toBe(false);
    expect(store.getState().tickets.available).toBe(1);
  });
});

describe('保存データの移行', () => {
  test('version 1 のデータを読み込むと、スキップは「チケットなし」になり、チケットは未配布になる', async () => {
    const storage = memoryStorage();
    const v1 = {
      state: {
        settings: { targetMinutes: 390, barcode: { type: 'ean13', data: '1' }, onboardingCompleted: true },
        records: [
          { date: '2026-10-26', kind: 'success', targetMinutes: 390, wakeMinutes: 395 },
          { date: '2026-10-27', kind: 'skip', targetMinutes: 390 },
        ],
      },
      version: 1,
    };
    storage.setItem('sleepvil', JSON.stringify(v1));

    const store = createAppStore(storage, new FakeAlarmScheduler());
    await store.persist.rehydrate();
    expect(store.getState().settings.onboardingCompleted).toBe(true);
    expect(store.getState().records[0]).toMatchObject({ kind: 'success', wakeMinutes: 395 });
    expect(store.getState().records[1]).toMatchObject({ kind: 'skip', ticketUsed: false });
    expect(store.getState().tickets).toEqual({ available: 0, lastGrantedWeek: null });
  });
});
