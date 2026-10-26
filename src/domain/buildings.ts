import {
  BUILDING_BASE_Y,
  BUILDING_HEIGHT_BASE,
  BUILDING_HEIGHT_PER_ERA,
  BUILDING_SLOTS_X,
  BUILDING_WIDTH,
} from '../config/villagers';

/** 建物の四角形(世界座標。x, y は左上) */
export type BuildingRect = { x: number; y: number; width: number; height: number };

/**
 * 時代と段階から、描く建物の四角形を求める。
 * 段階の数だけ建物を置き、時代が進むほど高くする。下端は BUILDING_BASE_Y にそろえる。
 */
export function buildingRects(eraIndex: number, buildingStage: number): BuildingRect[] {
  const height = BUILDING_HEIGHT_BASE + eraIndex * BUILDING_HEIGHT_PER_ERA;
  return BUILDING_SLOTS_X.slice(0, buildingStage).map((centerX) => ({
    x: centerX - BUILDING_WIDTH / 2,
    y: BUILDING_BASE_Y - height,
    width: BUILDING_WIDTH,
    height,
  }));
}
