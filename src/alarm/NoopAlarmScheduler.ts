import type { AlarmScheduler } from './AlarmScheduler';

/**
 * MVP用の実装。何もしない。
 * 暫定運用ではiPhone標準の時計で起き、自分でアプリを開いてスキャンするため。
 */
export class NoopAlarmScheduler implements AlarmScheduler {
  async schedule(_targetMinutes: number): Promise<void> {}

  async cancelAll(): Promise<void> {}
}
