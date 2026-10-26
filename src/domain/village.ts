import {
  FAR_SCALE,
  GROUND_FAR_Y,
  GROUND_NEAR_Y,
  JUMP_HEIGHT,
  JUMP_PERIOD_MS,
  NEAR_SCALE,
  VILLAGERS_BASE,
  VILLAGERS_MAX,
  VILLAGERS_PER_ERA,
} from '../config/villagers';
import { createVillager, type Random, type Villager } from './villager';

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

/** 人数を count にそろえる。足りなければ新しい村人を加え、多ければ後ろから減らす */
export function resizeVillagers(villagers: readonly Villager[], count: number, rng: Random): Villager[] {
  if (villagers.length >= count) {
    return villagers.slice(0, count);
  }
  const added = Array.from({ length: count - villagers.length }, (_, i) => createVillager(villagers.length + i, rng));
  return [...villagers, ...added];
}

/** 喜んでいる村人の跳ねる高さ。集合場所に着いてから跳ね、それ以外は0 */
export function jumpOffset(v: Villager): number {
  if (v.state !== 'reacting' || v.target !== null) {
    return 0;
  }
  // 残り時間に合わせて sin で上下させ、絶対値で地面より下に行かないようにする
  return Math.abs(Math.sin((v.remainingMs / JUMP_PERIOD_MS) * Math.PI)) * JUMP_HEIGHT;
}
