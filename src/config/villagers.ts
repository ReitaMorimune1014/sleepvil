// 村と村人に関するパラメータ(docs/REQUIREMENTS.md 第5章)
// 座標は「村の世界座標」で、画面の大きさに合わせて描画時に拡大縮小する

export type Point = { x: number; y: number };

/** 村の世界の大きさ(横は画面約2枚分) */
export const WORLD_WIDTH = 1200;
export const WORLD_HEIGHT = 600;

/** 村人が歩ける地面の範囲(y が小さいほど奥) */
export const GROUND_FAR_Y = 380;
export const GROUND_NEAR_Y = 560;

/** 奥と手前での描画の拡大率 */
export const FAR_SCALE = 0.6;
export const NEAR_SCALE = 1.0;

/** 建物を置く場所(中心のx)。段階1なら1番目だけ、段階5なら5つすべてに建てる */
export const BUILDING_SLOTS_X: readonly number[] = [180, 420, 640, 860, 1060];
/** 建物の下端(地面の奥の線) */
export const BUILDING_BASE_Y = 380;
export const BUILDING_WIDTH = 90;
/** 建物の高さ: 先史は60、時代が進むごとに20ずつ高くなる */
export const BUILDING_HEIGHT_BASE = 60;
export const BUILDING_HEIGHT_PER_ERA = 20;

/** 畑の場所(起きなかった日が続くと、しおれた色になる) */
export const FIELDS = [
  { x: 230, y: 455, width: 130, height: 40 },
  { x: 800, y: 490, width: 150, height: 40 },
];

/** 村人の行き先の候補 */
export const PLACES: readonly Point[] = [
  { x: 150, y: 420 },
  { x: 320, y: 520 },
  { x: 500, y: 400 },
  { x: 700, y: 540 },
  { x: 880, y: 430 },
  { x: 1050, y: 500 },
];

/** 喜ぶときに集まる場所(人ごとに横へずらす) */
export const GATHER_POINT: Point = { x: 600, y: 480 };
export const GATHER_SPACING = 30;

/** 歩く速さ(世界座標 / 秒) */
export const WALK_SPEED = 60;

/** 各状態の長さ(ミリ秒)。待機と作業は範囲内でランダムに決める */
export const IDLE_MS = { min: 2000, max: 5000 };
export const WORK_MS = { min: 3000, max: 6000 };
export const REACT_MS = 5000;

/** 喜ぶときに跳ねる高さ(世界座標)と、1回跳ねる時間(ミリ秒) */
export const JUMP_HEIGHT = 20;
export const JUMP_PERIOD_MS = 400;

/** 村人の大きさ(手前にいるとき。奥では depthScale で小さくする) */
export const VILLAGER_WIDTH = 22;
export const VILLAGER_HEIGHT = 36;

/** 人数: 先史は3人、時代が進むごとに1人増やす */
export const VILLAGERS_BASE = 3;
export const VILLAGERS_PER_ERA = 1;
export const VILLAGERS_MAX = 10;

/** 描画の更新頻度の上限(電池対策) */
export const VILLAGE_FPS = 30;
