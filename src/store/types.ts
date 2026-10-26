/** 停止に使うバーコード(登録時にスキャンした値) */
export type Barcode = {
  type: string;
  data: string;
};

/** 眠気の自己評価(1〜5、任意) */
export type Sleepiness = 1 | 2 | 3 | 4 | 5;

export type Settings = {
  /** 目標の起床時刻(0時からの経過分)。未設定なら null */
  targetMinutes: number | null;
  barcode: Barcode | null;
  onboardingCompleted: boolean;
};

/** 1日1件の記録。date は起床した日の端末ローカル日付(YYYY-MM-DD) */
export type DayRecord =
  | {
      date: string;
      kind: 'success';
      targetMinutes: number;
      wakeMinutes: number;
      sleepiness?: Sleepiness;
    }
  | {
      date: string;
      kind: 'skip';
      targetMinutes: number;
      sleepiness?: Sleepiness;
    };
