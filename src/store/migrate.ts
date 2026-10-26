import type { TicketState } from '../domain/tickets';
import type { DayRecord, Settings } from './types';

/** 保存するデータ(version 2)。時代や累計など、導出できるものは保存しない */
export type PersistedState = {
  settings: Settings;
  records: DayRecord[];
  tickets: TicketState;
};

export const PERSIST_VERSION = 2;

/** version 1 の形(チケットがなく、スキップに ticketUsed がない) */
type PersistedStateV1 = {
  settings: Settings;
  records: ({ kind: 'success' | 'skip' } & Record<string, unknown>)[];
};

/**
 * 古い version の保存データを、今の形に直す。データは消さずに引き継ぐ。
 * v1 → v2: スキップは「チケットなし」とみなし、チケットは未配布(次に開いたときに配る)にする。
 */
export function migratePersistedState(persisted: unknown, version: number): PersistedState {
  if (version < 2) {
    const v1 = persisted as PersistedStateV1;
    return {
      settings: v1.settings,
      records: v1.records.map((r) => (r.kind === 'skip' ? { ...r, ticketUsed: false } : r)) as DayRecord[],
      tickets: { available: 0, lastGrantedWeek: null },
    };
  }
  return persisted as PersistedState;
}
