// 村の進行に関するパラメータ(docs/REQUIREMENTS.md 第5章)

export type EraDefinition = {
  name: string;
  /** この時代が始まる累計成功日数 */
  startDay: number;
  /** この時代の長さ(日) */
  lengthDays: number;
};

export const ERAS: readonly EraDefinition[] = [
  { name: '先史', startDay: 0, lengthDays: 60 },
  { name: '古代', startDay: 60, lengthDays: 55 },
  { name: '中世', startDay: 115, lengthDays: 55 },
  { name: '近世', startDay: 170, lengthDays: 50 },
  { name: '近代', startDay: 220, lengthDays: 50 },
  { name: '現代', startDay: 270, lengthDays: 50 },
  { name: '未来', startDay: 320, lengthDays: 45 },
];

/** 1時代あたりの建物の段階数。時代の長さを等分して段階を進める */
export const BUILDING_STAGES_PER_ERA = 5;
