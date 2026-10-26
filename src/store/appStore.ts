import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { AlarmScheduler } from '../alarm/AlarmScheduler';
import { totalSuccessDays } from '../domain/points';
import { grantWeeklyTicket } from '../domain/tickets';
import { migratePersistedState, PERSIST_VERSION, type PersistedState } from './migrate';
import type { Barcode, DayRecord, Sleepiness } from './types';

type Actions = {
  setTargetTime: (minutes: number) => Promise<void>;
  registerBarcode: (barcode: Barcode) => void;
  completeOnboarding: () => void;
  /** 記録できたら true。その日に記録済み、または目標時刻が未設定なら false */
  recordSuccess: (date: string, wakeMinutes: number) => boolean;
  /**
   * スキップを記録する。useTicket なら、お休みチケットを1枚使う(連続日数が途切れない)。
   * その日に記録済み、目標時刻が未設定、またはチケットを使うのに残りがなければ false
   */
  recordSkip: (date: string, useTicket: boolean) => boolean;
  /** 新しい週になっていればチケットを配る。アプリを開いたときに呼ぶ */
  grantTickets: (today: string) => void;
  /** その日の記録に眠気を付ける。記録がなければ false */
  setSleepiness: (date: string, sleepiness: Sleepiness) => boolean;
  /** 設定と記録をすべて消し、アラームも取り消す(開発中の動作確認用) */
  resetAll: () => Promise<void>;
};

export type AppState = PersistedState & Actions;

const initialState: PersistedState = {
  settings: { targetMinutes: null, barcode: null, onboardingCompleted: false },
  records: [],
  tickets: { available: 0, lastGrantedWeek: null },
};

/**
 * ストアを作る。保存先とアラームの実装を外から渡すことで、テストでは差し替えられる。
 * アプリ本体で使うストアは src/store/index.ts で作る。
 */
export function createAppStore(storage: StateStorage, alarmScheduler: AlarmScheduler) {
  return create<AppState>()(
    persist(
      (set, get) => {
        // 1日1件。先に記録したほうを残す(成功をあとからスキップで取り消せないようにする)
        const addRecord = (record: DayRecord): boolean => {
          if (get().records.some((r) => r.date === record.date)) {
            return false;
          }
          set({ records: [...get().records, record] });
          return true;
        };

        return {
          ...initialState,

          setTargetTime: async (minutes) => {
            set({ settings: { ...get().settings, targetMinutes: minutes } });
            await alarmScheduler.schedule(minutes);
          },

          registerBarcode: (barcode) => set({ settings: { ...get().settings, barcode } }),

          completeOnboarding: () => set({ settings: { ...get().settings, onboardingCompleted: true } }),

          recordSuccess: (date, wakeMinutes) => {
            const { targetMinutes } = get().settings;
            if (targetMinutes === null) {
              return false;
            }
            return addRecord({ date, kind: 'success', targetMinutes, wakeMinutes });
          },

          recordSkip: (date, useTicket) => {
            const { settings, tickets } = get();
            if (settings.targetMinutes === null || (useTicket && tickets.available < 1)) {
              return false;
            }
            const added = addRecord({ date, kind: 'skip', targetMinutes: settings.targetMinutes, ticketUsed: useTicket });
            if (added && useTicket) {
              set({ tickets: { ...tickets, available: tickets.available - 1 } });
            }
            return added;
          },

          grantTickets: (today) => set({ tickets: grantWeeklyTicket(get().tickets, today) }),

          setSleepiness: (date, sleepiness) => {
            if (!get().records.some((r) => r.date === date)) {
              return false;
            }
            set({ records: get().records.map((r) => (r.date === date ? { ...r, sleepiness } : r)) });
            return true;
          },

          resetAll: async () => {
            set(initialState);
            await alarmScheduler.cancelAll();
          },
        };
      },
      {
        name: 'sleepvil',
        // データの形を変えるときに番号を上げ、migrate で古いデータを移行する
        version: PERSIST_VERSION,
        migrate: migratePersistedState,
        storage: createJSONStorage(() => storage),
        partialize: (state): PersistedState => ({
          settings: state.settings,
          records: state.records,
          tickets: state.tickets,
        }),
      },
    ),
  );
}

/** 累計成功日数(保存せず、記録から毎回計算する) */
export function selectTotalSuccessDays(state: AppState): number {
  return totalSuccessDays(state.records.filter((r) => r.kind === 'success'));
}
