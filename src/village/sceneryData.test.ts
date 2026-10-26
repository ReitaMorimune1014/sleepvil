import { mountainPath, snowCapPath } from './sceneryData';

const m = { x: 0, baseY: 400, width: 200, height: 100 };

describe('mountainPath', () => {
  test('左の麓 → 山頂 → 右の麓 の三角形', () => {
    expect(mountainPath(m)).toBe('M 0 400 L 100 300 L 200 400 Z');
  });
});

describe('snowCapPath', () => {
  test('山頂から高さの一部だけを覆う、山と同じ傾きの三角形', () => {
    // 高さ 100 × 0.2 = 20、幅の半分 100 × 0.2 = 20
    expect(snowCapPath(m, 0.2)).toBe('M 80 320 L 100 300 L 120 320 Z');
  });
});
