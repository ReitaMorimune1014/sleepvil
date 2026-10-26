import { BUILDING_BASE_Y, BUILDING_SLOTS_X } from '../config/villagers';
import { buildingRects } from './buildings';

describe('buildingRects', () => {
  test('段階の数だけ建物を置く', () => {
    expect(buildingRects(0, 1)).toHaveLength(1);
    expect(buildingRects(0, 5)).toHaveLength(5);
  });

  test('建物の中心は置き場所のx、下端は地面の線にそろう', () => {
    for (const [i, rect] of buildingRects(0, 5).entries()) {
      expect(rect.x + rect.width / 2).toBe(BUILDING_SLOTS_X[i]);
      expect(rect.y + rect.height).toBe(BUILDING_BASE_Y);
    }
  });

  test('時代が進むほど高くなる', () => {
    const prehistoric = buildingRects(0, 1)[0].height;
    const future = buildingRects(6, 1)[0].height;
    expect(future).toBeGreaterThan(prehistoric);
  });
});
