import { BUILDING_STAGES_PER_ERA, ERAS } from '../config/village';
import { getVillageProgress } from './era';

describe('ERAS の設定', () => {
  test('各時代の開始日は、前の時代の開始日+長さと一致する', () => {
    for (let i = 1; i < ERAS.length; i++) {
      expect(ERAS[i].startDay).toBe(ERAS[i - 1].startDay + ERAS[i - 1].lengthDays);
    }
  });
});

describe('getVillageProgress', () => {
  test('0日は先史の段階1', () => {
    expect(getVillageProgress(0)).toEqual({ eraIndex: 0, eraName: '先史', buildingStage: 1 });
  });

  test('先史は12日ごとに段階が進む(60日を5等分)', () => {
    expect(getVillageProgress(11).buildingStage).toBe(1);
    expect(getVillageProgress(12).buildingStage).toBe(2);
    expect(getVillageProgress(48).buildingStage).toBe(5);
  });

  test('0.5日分は切り捨てて判定する', () => {
    expect(getVillageProgress(11.5).buildingStage).toBe(1);
    expect(getVillageProgress(59.5)).toEqual({ eraIndex: 0, eraName: '先史', buildingStage: 5 });
  });

  test('時代の境目: 60日で古代の段階1になる', () => {
    expect(getVillageProgress(60)).toEqual({ eraIndex: 1, eraName: '古代', buildingStage: 1 });
  });

  test('各時代の開始日は段階1、最終日は最終段階', () => {
    for (const era of ERAS) {
      expect(getVillageProgress(era.startDay)).toMatchObject({ eraName: era.name, buildingStage: 1 });
      expect(getVillageProgress(era.startDay + era.lengthDays - 1)).toMatchObject({
        eraName: era.name,
        buildingStage: BUILDING_STAGES_PER_ERA,
      });
    }
  });

  test('最後の時代を超えても、未来の最終段階で止まる', () => {
    expect(getVillageProgress(365)).toEqual({ eraIndex: 6, eraName: '未来', buildingStage: 5 });
    expect(getVillageProgress(1000)).toEqual({ eraIndex: 6, eraName: '未来', buildingStage: 5 });
  });

  test('負の値は0日として扱う', () => {
    expect(getVillageProgress(-3)).toEqual({ eraIndex: 0, eraName: '先史', buildingStage: 1 });
  });
});
