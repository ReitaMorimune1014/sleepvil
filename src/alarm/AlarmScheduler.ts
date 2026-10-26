/**
 * アラームの予約と取り消しの窓口(docs/REQUIREMENTS.md 第7章)。
 * 画面やストアはこのインターフェースだけを使い、実装(何もしない / AlarmKit など)は差し替えられるようにする。
 */
export interface AlarmScheduler {
  /** 毎日の目標時刻(0時からの経過分)にアラームを予約する。既存の予約は置き換える */
  schedule(targetMinutes: number): Promise<void>;

  /** 予約をすべて取り消す */
  cancelAll(): Promise<void>;
}
