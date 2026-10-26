import {
  GATHER_POINT,
  GATHER_SPACING,
  IDLE_MS,
  PLACES,
  REACT_MS,
  WALK_SPEED,
  WORK_MS,
  type Point,
} from '../config/villagers';

/** 待機 → 歩行 → 作業 → 待機 … を繰り返す。反応(喜ぶ)は外から始める */
export type VillagerState = 'idle' | 'walking' | 'working' | 'reacting';

export type Villager = {
  id: number;
  position: Point;
  state: VillagerState;
  /** 向かっている場所。歩行中・集合中以外は null */
  target: Point | null;
  /** 今の状態の残り時間(ミリ秒)。歩行中は使わない */
  remainingMs: number;
};

/** 0以上1未満の数を返す関数。テストでは固定値を渡して結果を決める */
export type Random = () => number;

function randomBetween(range: { min: number; max: number }, rng: Random): number {
  return range.min + (range.max - range.min) * rng();
}

function pickPlace(rng: Random): Point {
  const index = Math.min(Math.floor(rng() * PLACES.length), PLACES.length - 1);
  return PLACES[index];
}

/** from から to へ、最大 maxDistance だけ進む。届いたら arrived が true */
export function moveToward(from: Point, to: Point, maxDistance: number): { position: Point; arrived: boolean } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance) {
    return { position: to, arrived: true };
  }
  const ratio = maxDistance / distance;
  return { position: { x: from.x + dx * ratio, y: from.y + dy * ratio }, arrived: false };
}

/** 喜ぶときの集合場所。0番は中央、1番は左、2番は右 … と交互に並べる */
export function gatherPointFor(id: number): Point {
  const side = id % 2 === 0 ? 1 : -1;
  return { x: GATHER_POINT.x + side * Math.ceil(id / 2) * GATHER_SPACING, y: GATHER_POINT.y };
}

/** 村人を1人作る。ランダムな場所で待機から始める */
export function createVillager(id: number, rng: Random): Villager {
  return { id, position: pickPlace(rng), state: 'idle', target: null, remainingMs: randomBetween(IDLE_MS, rng) };
}

/** 村人を喜ぶ状態にする。集合場所まで歩き、着いたら REACT_MS の間喜ぶ */
export function startReaction(v: Villager): Villager {
  return { ...v, state: 'reacting', target: gatherPointFor(v.id), remainingMs: REACT_MS };
}

/** 時間を dtMs だけ進めた村人を返す(元の村人は変更しない) */
export function stepVillager(v: Villager, dtMs: number, rng: Random): Villager {
  const step = (WALK_SPEED * dtMs) / 1000;

  switch (v.state) {
    case 'idle': {
      const remainingMs = v.remainingMs - dtMs;
      if (remainingMs > 0) {
        return { ...v, remainingMs };
      }
      return { ...v, state: 'walking', target: pickPlace(rng), remainingMs: 0 };
    }

    case 'walking': {
      const { position, arrived } = moveToward(v.position, v.target ?? v.position, step);
      if (!arrived) {
        return { ...v, position };
      }
      return { ...v, position, state: 'working', target: null, remainingMs: randomBetween(WORK_MS, rng) };
    }

    case 'working': {
      const remainingMs = v.remainingMs - dtMs;
      if (remainingMs > 0) {
        return { ...v, remainingMs };
      }
      return { ...v, state: 'idle', remainingMs: randomBetween(IDLE_MS, rng) };
    }

    case 'reacting': {
      // 集合場所に着くまでは歩き、着いてから残り時間を減らす
      if (v.target) {
        const { position, arrived } = moveToward(v.position, v.target, step);
        return { ...v, position, target: arrived ? null : v.target };
      }
      const remainingMs = v.remainingMs - dtMs;
      if (remainingMs > 0) {
        return { ...v, remainingMs };
      }
      return { ...v, state: 'idle', remainingMs: randomBetween(IDLE_MS, rng) };
    }
  }
}
