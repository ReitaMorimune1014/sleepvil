import type { AlarmScheduler } from './AlarmScheduler';

/** テスト用の実装。予約の状態を記録するだけで、実際には鳴らさない */
export class FakeAlarmScheduler implements AlarmScheduler {
  /** 現在予約されている目標時刻。予約がなければ null */
  scheduledMinutes: number | null = null;

  /** 呼ばれた操作の履歴(テストで順序を確かめるため) */
  calls: string[] = [];

  async schedule(targetMinutes: number): Promise<void> {
    this.scheduledMinutes = targetMinutes;
    this.calls.push(`schedule:${targetMinutes}`);
  }

  async cancelAll(): Promise<void> {
    this.scheduledMinutes = null;
    this.calls.push('cancelAll');
  }
}
