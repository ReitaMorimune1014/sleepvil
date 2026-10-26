import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import type { AlarmScheduler } from '../alarm/AlarmScheduler';
import { totalSuccessDays } from '../domain/points';
import type { Barcode, DayRecord, Settings, Sleepiness } from './types';

/** 保存するデータ。時代や累計など、導出できるものは保存しない */
type PersistedState = {
  settings: Settings;
  records: DayRecord[];
};

type Actions = {
  setTargetTime: (minutes: number) => Promise<void>;
  registerBarcode: (barcode: Barcode) => void;
  completeOnboarding: () => void;
  /** 記録できたら true。その日に記録済み、または目標時刻が未設定なら false */
  recordSuccess: (date: string, wakeMinutes: number) => boolean;
  recordSkip: (date: string) => boolean;
  /** その日の記録に眠気を付ける。記録がなければ false */
  setSleepiness: (date: string, sleepiness: Sleepiness) => boolean;
};

export type AppState = PersistedState & Actions;

const initialState: PersistedState = {
  settings: { targetMinutes: null, barcode: null, onboardingCompleted: false },
  records: [],
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

          recordSkip: (date) => {
            const { targetMinutes } = get().settings;
            if (targetMinutes === null) {
              return false;
            }
            return addRecord({ date, kind: 'skip', targetMinutes });
          },

          setSleepiness: (date, sleepiness) => {
            if (!get().records.some((r) => r.date === date)) {
              return false;
            }
            set({ records: get().records.map((r) => (r.date === date ? { ...r, sleepiness } : r)) });
            return true;
          },
        };
      },
      {
        name: 'sleepvil',
        // お休みチケットなどを足すときに番号を上げ、古いデータを移行する
        version: 1,
        storage: createJSONStorage(() => storage),
        partialize: (state): PersistedState => ({ settings: state.settings, records: state.records }),
      },
    ),
  );
}

/** 累計成功日数(保存せず、記録から毎回計算する) */
export function selectTotalSuccessDays(state: AppState): number {
  return totalSuccessDays(state.records.filter((r) => r.kind === 'success'));
}
