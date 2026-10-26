// 村の色(当面は四角形のプレースホルダー。本番の絵に差し替えるまでの仮の色)

export const SKY_COLOR = '#cfe8ff';
export const FAR_MOUNTAIN_COLOR = '#a9bfd6';
export const MID_HILL_COLOR = '#9cc49a';
export const GROUND_COLOR = '#b9d98c';
export const VILLAGER_BODY_COLOR = '#e07a5f';
export const VILLAGER_HEAD_COLOR = '#f2cc8f';

/** 時代ごとの建物の色(ERAS と同じ順番) */
export const ERA_BUILDING_COLORS: readonly string[] = [
  '#8b6b4a', // 先史: 木と土
  '#c2a878', // 古代: 石
  '#9a8f85', // 中世: 城壁
  '#b5583a', // 近世: 瓦
  '#a0522d', // 近代: れんが
  '#7f8c99', // 現代: コンクリート
  '#5ec8d8', // 未来: ガラス
];
