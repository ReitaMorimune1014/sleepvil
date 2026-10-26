import {
  FAR_SCALE,
  GROUND_FAR_Y,
  GROUND_NEAR_Y,
  NEAR_SCALE,
  VILLAGERS_BASE,
  VILLAGERS_MAX,
  VILLAGERS_PER_ERA,
} from '../config/villagers';
import type { Villager } from './villager';

/** 時代(0始まり)に応じた村人の人数。上限は VILLAGERS_MAX */
export function villagerCount(eraIndex: number): number {
  return Math.min(VILLAGERS_BASE + eraIndex * VILLAGERS_PER_ERA, VILLAGERS_MAX);
}

/** y座標から描画の拡大率を求める。奥(y が小さい)ほど小さく描く */
export function depthScale(y: number): number {
  const t = (y - GROUND_FAR_Y) / (GROUND_NEAR_Y - GROUND_FAR_Y);
  const clamped = Math.min(Math.max(t, 0), 1);
  return FAR_SCALE + (NEAR_SCALE - FAR_SCALE) * clamped;
}

/** 奥から手前の順に並べる(後に描いたものが手前に重なる) */
export function sortByDepth(villagers: readonly Villager[]): Villager[] {
  return [...villagers].sort((a, b) => a.position.y - b.position.y);
}
