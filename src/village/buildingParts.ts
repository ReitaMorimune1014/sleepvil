import type { BuildingRect } from '../domain/buildings';

/**
 * 四角形の中に、窓を cols 列 × rows 行で等間隔に並べる。
 * 窓の間と外周には gap の余白をとる。
 */
export function windowGrid(area: BuildingRect, cols: number, rows: number, gap: number): BuildingRect[] {
  const width = (area.width - gap * (cols + 1)) / cols;
  const height = (area.height - gap * (rows + 1)) / rows;
  const windows: BuildingRect[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      windows.push({
        x: area.x + gap + col * (width + gap),
        y: area.y + gap + row * (height + gap),
        width,
        height,
      });
    }
  }
  return windows;
}

/** 三角屋根。下の辺は y = bottom、左右に overhang だけはみ出す */
export function gableRoofPath(left: number, right: number, top: number, bottom: number, overhang = 0): string {
  return `M ${left - overhang} ${bottom} L ${(left + right) / 2} ${top} L ${right + overhang} ${bottom} Z`;
}

/** 台形の屋根(瓦屋根)。上の辺は左右から inset だけ内側 */
export function hipRoofPath(left: number, right: number, top: number, bottom: number, inset: number, overhang = 0): string {
  return `M ${left - overhang} ${bottom} L ${left + inset} ${top} L ${right - inset} ${top} L ${right + overhang} ${bottom} Z`;
}

/** 半円のドーム。下の辺は y = bottom */
export function domePath(left: number, right: number, bottom: number): string {
  const r = (right - left) / 2;
  return `M ${left} ${bottom} A ${r} ${r} 0 0 1 ${right} ${bottom} Z`;
}
