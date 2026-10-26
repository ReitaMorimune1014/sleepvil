import type { Villager } from '../domain/villager';

/** 歩幅の目安(世界座標)。この距離進むごとに脚の振りが一巡する */
const STRIDE = 8;

export type Pose = {
  /** 向き。1 = 右、-1 = 左 */
  facing: 1 | -1;
  /** 脚の振り(-1〜1)。止まっているときは0 */
  legSwing: number;
  /** 喜んでいるときは両手を上げる */
  armsUp: boolean;
  /** 空を見上げて待っている */
  lookUp: boolean;
};

/**
 * 村人の見た目の姿勢を、状態と位置から決める。
 * 時刻を使わず位置から脚の振りを決めるので、歩いた距離に合わせて脚が動く。
 */
export function villagerPose(v: Villager, waiting: boolean): Pose {
  const moving = v.target !== null && (v.state === 'walking' || v.state === 'reacting');
  const dx = v.target ? v.target.x - v.position.x : 0;
  // 行き先がないときは、人ごとに向きを決めておく(全員が同じ向きにならないように)
  const facing: 1 | -1 = dx > 0 ? 1 : dx < 0 ? -1 : v.id % 2 === 0 ? 1 : -1;
  return {
    facing,
    legSwing: moving ? Math.sin(v.position.x / STRIDE) : 0,
    armsUp: v.state === 'reacting' && v.target === null,
    lookUp: waiting,
  };
}
