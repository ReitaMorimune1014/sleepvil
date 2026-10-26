import { BUILDING_STAGES_PER_ERA, ERAS } from '../config/village';

export type VillageProgress = {
  /** ERAS の何番目の時代か(0始まり) */
  eraIndex: number;
  eraName: string;
  /** 建物の段階(1〜BUILDING_STAGES_PER_ERA) */
  buildingStage: number;
};

/**
 * 累計成功日数から、村の時代と建物の段階を導出する。
 * 段階は保存せず、毎回この関数で計算する(CLAUDE.md の設計ルール)。
 */
export function getVillageProgress(totalSuccessDays: number): VillageProgress {
  // 0.5日分が混ざるため、閾値との比較は切り捨てた日数で行う
  const days = Math.max(0, Math.floor(totalSuccessDays));

  // 開始日を過ぎた時代のうち、最後のものが現在の時代
  let eraIndex = 0;
  for (let i = 0; i < ERAS.length; i++) {
    if (days >= ERAS[i].startDay) {
      eraIndex = i;
    }
  }
  const era = ERAS[eraIndex];

  // 最後の時代を超えても、最終段階で止める(成長は後退しない)
  const daysIntoEra = Math.min(days - era.startDay, era.lengthDays - 1);
  const daysPerStage = era.lengthDays / BUILDING_STAGES_PER_ERA;
  const buildingStage = Math.floor(daysIntoEra / daysPerStage) + 1;

  return { eraIndex, eraName: era.name, buildingStage };
}
