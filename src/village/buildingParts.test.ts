import { domePath, gableRoofPath, hipRoofPath, windowGrid } from './buildingParts';

describe('windowGrid', () => {
  test('列 × 行の数だけ、余白をとって等間隔に並べる', () => {
    // 幅 100 に 2列、余白 10: 窓の幅は (100 - 30) / 2 = 35
    const windows = windowGrid({ x: 0, y: 0, width: 100, height: 70 }, 2, 2, 10);
    expect(windows).toHaveLength(4);
    expect(windows[0]).toEqual({ x: 10, y: 10, width: 35, height: 20 });
    expect(windows[3]).toEqual({ x: 55, y: 40, width: 35, height: 20 });
  });

  test('窓は外枠からはみ出さない', () => {
    const area = { x: 20, y: 30, width: 90, height: 120 };
    for (const w of windowGrid(area, 3, 4, 6)) {
      expect(w.x).toBeGreaterThanOrEqual(area.x);
      expect(w.y).toBeGreaterThanOrEqual(area.y);
      expect(w.x + w.width).toBeLessThanOrEqual(area.x + area.width + 1e-9);
      expect(w.y + w.height).toBeLessThanOrEqual(area.y + area.height + 1e-9);
    }
  });
});

describe('屋根の形', () => {
  test('三角屋根は、はみ出しを含めた左右の端と真ん中の頂点', () => {
    expect(gableRoofPath(0, 100, 20, 60, 5)).toBe('M -5 60 L 50 20 L 105 60 Z');
  });

  test('台形の屋根は、上の辺が内側に寄る', () => {
    expect(hipRoofPath(0, 100, 20, 60, 15)).toBe('M 0 60 L 15 20 L 85 20 L 100 60 Z');
  });

  test('ドームは左右の端を結ぶ半円', () => {
    expect(domePath(0, 80, 50)).toBe('M 0 50 A 40 40 0 0 1 80 50 Z');
  });
});
