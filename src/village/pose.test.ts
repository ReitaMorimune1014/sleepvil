import type { Villager } from '../domain/villager';
import { villagerPose } from './pose';

const base: Villager = { id: 0, position: { x: 100, y: 450 }, state: 'idle', target: null, remainingMs: 1000 };

describe('villagerPose', () => {
  test('行き先に向かって向きを変える', () => {
    expect(villagerPose({ ...base, state: 'walking', target: { x: 300, y: 450 } }, false).facing).toBe(1);
    expect(villagerPose({ ...base, state: 'walking', target: { x: 10, y: 450 } }, false).facing).toBe(-1);
  });

  test('止まっているときは脚を振らず、向きは人ごとに決まる', () => {
    expect(villagerPose(base, false).legSwing).toBe(0);
    expect(villagerPose({ ...base, id: 0 }, false).facing).toBe(1);
    expect(villagerPose({ ...base, id: 1 }, false).facing).toBe(-1);
  });

  test('歩いているときは、位置に応じて脚を振る(-1〜1)', () => {
    const swings = [0, 4, 8, 12, 16].map(
      (x) => villagerPose({ ...base, position: { x, y: 450 }, state: 'walking', target: { x: 500, y: 450 } }, false).legSwing,
    );
    expect(new Set(swings.map((s) => s.toFixed(3))).size).toBeGreaterThan(1);
    swings.forEach((s) => expect(Math.abs(s)).toBeLessThanOrEqual(1));
  });

  test('集合場所に着いて喜んでいるときだけ、両手を上げる', () => {
    expect(villagerPose({ ...base, state: 'reacting', target: null }, false).armsUp).toBe(true);
    expect(villagerPose({ ...base, state: 'reacting', target: { x: 600, y: 480 } }, false).armsUp).toBe(false);
  });

  test('待っているときは空を見上げる', () => {
    expect(villagerPose(base, true).lookUp).toBe(true);
    expect(villagerPose(base, false).lookUp).toBe(false);
  });
});
