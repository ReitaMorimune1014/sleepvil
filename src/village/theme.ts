// 村の色。本番の絵(docs/ART.md)に差し替えるまでの、Skia の図形用の色

// 空は夜明けの色のグラデーション
export const SKY_TOP_COLOR = '#9cc9f0';
export const SKY_BOTTOM_COLOR = '#fde3c2';
export const CLOUD_COLOR = '#ffffffcc';

export const FAR_MOUNTAIN_COLOR = '#9fb4cf';
export const FAR_MOUNTAIN_COLOR_2 = '#b1c3d9';
export const SNOW_COLOR = '#f4f7fb';
export const MID_HILL_COLOR = '#8fbf86';
export const MID_HILL_COLOR_2 = '#a3cc94';
export const TREE_TRUNK_COLOR = '#7a5534';
export const TREE_CROWN_COLOR = '#4f8f4a';

export const GROUND_COLOR = '#b9d98c';
/** 起きなかった日が続いたときの地面と畑(しおれた色) */
export const GROUND_WILTED_COLOR = '#cfc59a';
export const FIELD_COLOR = '#5f9e3f';
export const FIELD_ROW_COLOR = '#4a8331';
export const FIELD_WILTED_COLOR = '#a0865a';
export const FIELD_WILTED_ROW_COLOR = '#8a7049';

export const VILLAGER_BODY_COLOR = '#e07a5f';
export const VILLAGER_HEAD_COLOR = '#f2cc8f';
export const VILLAGER_LIMB_COLOR = '#5b4636';
export const VILLAGER_EYE_COLOR = '#2b2b2b';

export const WINDOW_COLOR = '#ffe8a3';
export const DOOR_COLOR = '#4a3426';

/** 時代ごとの建物の壁の色(ERAS と同じ順番) */
export const ERA_BUILDING_COLORS: readonly string[] = [
  '#8b6b4a', // 先史: 木と土
  '#d8c39a', // 古代: 石
  '#c9b8a3', // 中世: 木組みと漆喰
  '#efe6d4', // 近世: 白壁
  '#a0522d', // 近代: れんが
  '#aab4bf', // 現代: コンクリート
  '#cfeff5', // 未来: ガラス
];

/** 時代ごとの屋根の色 */
export const ERA_ROOF_COLORS: readonly string[] = [
  '#c9a45c', // 先史: わら
  '#b99a6b', // 古代: 石の破風
  '#8c4a3b', // 中世: 赤茶の屋根
  '#4f5560', // 近世: 瓦
  '#5a3a2e', // 近代: 黒っぽい屋根
  '#6f7a86', // 現代: 屋上
  '#5ec8d8', // 未来: ガラスのドーム
];
