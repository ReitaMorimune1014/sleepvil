// 背景の図形(世界座標)。本番の絵(docs/ART.md)に差し替えるまでの、Skia の図形による仮の絵

/** 三角形の山。x は左端、baseY は麓の高さ */
export type Mountain = { x: number; baseY: number; width: number; height: number };

export const MOUNTAINS: readonly Mountain[] = [
  { x: -60, baseY: 400, width: 420, height: 210 },
  { x: 250, baseY: 400, width: 360, height: 160 },
  { x: 520, baseY: 400, width: 460, height: 240 },
  { x: 880, baseY: 400, width: 380, height: 180 },
];

/** 楕円の丘 */
export const HILLS = [
  { x: -80, y: 330, width: 420, height: 140 },
  { x: 260, y: 345, width: 380, height: 120 },
  { x: 560, y: 325, width: 460, height: 150 },
  { x: 920, y: 340, width: 400, height: 130 },
];

/** 雲(丸を3つ重ねる)。cx, cy は真ん中の丸の中心 */
export const CLOUDS = [
  { cx: 120, cy: 90, r: 26 },
  { cx: 430, cy: 60, r: 20 },
  { cx: 760, cy: 110, r: 30 },
  { cx: 1040, cy: 70, r: 22 },
];

/** 地面の奥に並ぶ木。x は幹の中心、y は根元 */
export const TREES = [
  { x: 60, y: 392 },
  { x: 300, y: 386 },
  { x: 540, y: 394 },
  { x: 760, y: 388 },
  { x: 960, y: 392 },
  { x: 1160, y: 386 },
];

/** 山の三角形を SVG のパス文字列にする */
export function mountainPath(m: Mountain): string {
  return `M ${m.x} ${m.baseY} L ${m.x + m.width / 2} ${m.baseY - m.height} L ${m.x + m.width} ${m.baseY} Z`;
}

/** 山頂の雪(山の上から ratio の高さまでの小さな三角形) */
export function snowCapPath(m: Mountain, ratio = 0.22): string {
  const peakX = m.x + m.width / 2;
  const peakY = m.baseY - m.height;
  const h = m.height * ratio;
  const halfW = (m.width / 2) * ratio;
  return `M ${peakX - halfW} ${peakY + h} L ${peakX} ${peakY} L ${peakX + halfW} ${peakY + h} Z`;
}
