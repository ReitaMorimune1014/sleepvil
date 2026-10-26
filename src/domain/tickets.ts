import { MAX_TICKETS, TICKETS_PER_WEEK } from '../config/tickets';
import { startOfWeek } from './week';

export type TicketState = {
  available: number;
  /** 最後にチケットを配った週の月曜日。まだ配っていなければ null */
  lastGrantedWeek: string | null;
};

/** 新しい週になっていれば、チケットを配る(上限を超えない)。同じ週なら何もしない */
export function grantWeeklyTicket(state: TicketState, today: string): TicketState {
  const week = startOfWeek(today);
  if (state.lastGrantedWeek === week) {
    return state;
  }
  return {
    available: Math.min(state.available + TICKETS_PER_WEEK, MAX_TICKETS),
    lastGrantedWeek: week,
  };
}
