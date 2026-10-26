import { FAR_SCALE, GROUND_FAR_Y, GROUND_NEAR_Y, NEAR_SCALE, VILLAGERS_MAX } from '../config/villagers';
import { depthScale, sortByDepth, villagerCount } from './village';
import type { Villager } from './villager';

describe('villagerCount', () => {
  test('先史は3人、時代ごとに1人増える', () => {
    expect(villagerCount(0)).toBe(3);
    expect(villagerCount(6)).toBe(9);
  });

  test('上限を超えない', () => {
    expect(villagerCount(100)).toBe(VILLAGERS_MAX);
  });
});

describe('depthScale', () => {
  test('奥は小さく、手前は大きく、中間はその間', () => {
    expect(depthScale(GROUND_FAR_Y)).toBe(FAR_SCALE);
    expect(depthScale(GROUND_NEAR_Y)).toBe(NEAR_SCALE);
    expect(depthScale((GROUND_FAR_Y + GROUND_NEAR_Y) / 2)).toBeCloseTo((FAR_SCALE + NEAR_SCALE) / 2);
  });

  test('地面の範囲の外は、端の値にそろえる', () => {
    expect(depthScale(0)).toBe(FAR_SCALE);
    expect(depthScale(9999)).toBe(NEAR_SCALE);
  });
});

describe('sortByDepth', () => {
  const at = (id: number, y: number): Villager => ({ id, position: { x: 0, y }, state: 'idle', target: null, remainingMs: 0 });

  test('奥(y が小さい)から手前の順に並べ、元の配列は変えない', () => {
    const villagers = [at(0, 500), at(1, 400), at(2, 450)];
    expect(sortByDepth(villagers).map((v) => v.id)).toEqual([1, 2, 0]);
    expect(villagers.map((v) => v.id)).toEqual([0, 1, 2]);
  });
});
