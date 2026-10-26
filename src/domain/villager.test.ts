import { IDLE_MS, PLACES, REACT_MS, WORK_MS } from '../config/villagers';
import { createVillager, gatherPointFor, moveToward, startReaction, stepVillager, type Villager } from './villager';

// 常に0を返す乱数: 行き先は PLACES[0]、待機・作業の長さは最小値になる
const rng0 = () => 0;

describe('moveToward', () => {
  test('届かなければ、向きを保って maxDistance だけ進む', () => {
    expect(moveToward({ x: 0, y: 0 }, { x: 30, y: 40 }, 10)).toEqual({ position: { x: 6, y: 8 }, arrived: false });
  });

  test('届くなら目的地に着く', () => {
    expect(moveToward({ x: 0, y: 0 }, { x: 3, y: 4 }, 10)).toEqual({ position: { x: 3, y: 4 }, arrived: true });
  });
});

describe('gatherPointFor', () => {
  test('0番は中央、1番は左、2番は右と交互に並ぶ', () => {
    expect([0, 1, 2, 3].map((id) => gatherPointFor(id).x)).toEqual([600, 570, 630, 540]);
  });
});

describe('stepVillager', () => {
  test('待機の時間が終わると、行き先を決めて歩き出す', () => {
    const v = createVillager(0, rng0);
    expect(v).toMatchObject({ state: 'idle', remainingMs: IDLE_MS.min });

    const waiting = stepVillager(v, 1000, rng0);
    expect(waiting).toMatchObject({ state: 'idle', remainingMs: IDLE_MS.min - 1000 });

    const walking = stepVillager(waiting, IDLE_MS.min, rng0);
    expect(walking).toMatchObject({ state: 'walking', target: PLACES[0] });
  });

  test('歩行中は速さに応じて進み、着いたら作業を始める', () => {
    const v: Villager = { id: 0, position: { x: 0, y: 420 }, state: 'walking', target: { x: 150, y: 420 }, remainingMs: 0 };

    const moved = stepVillager(v, 1000, rng0); // 60/秒 × 1秒
    expect(moved).toMatchObject({ state: 'walking', position: { x: 60, y: 420 } });

    const arrived = stepVillager(moved, 2000, rng0);
    expect(arrived).toMatchObject({ state: 'working', position: { x: 150, y: 420 }, target: null, remainingMs: WORK_MS.min });
  });

  test('作業の時間が終わると、待機に戻る', () => {
    const v: Villager = { id: 0, position: { x: 150, y: 420 }, state: 'working', target: null, remainingMs: 500 };
    expect(stepVillager(v, 500, rng0)).toMatchObject({ state: 'idle', remainingMs: IDLE_MS.min });
  });

  test('元の村人は変更しない', () => {
    const v = createVillager(0, rng0);
    stepVillager(v, 1000, rng0);
    expect(v.remainingMs).toBe(IDLE_MS.min);
  });
});

describe('startReaction', () => {
  test('集合場所まで歩き、着いてから REACT_MS 喜んで、待機に戻る', () => {
    const start: Villager = { id: 0, position: { x: 540, y: 480 }, state: 'working', target: null, remainingMs: 9999 };
    const reacting = startReaction(start);
    expect(reacting).toMatchObject({ state: 'reacting', target: { x: 600, y: 480 }, remainingMs: REACT_MS });

    const gathered = stepVillager(reacting, 1000, rng0); // 60進んで集合場所に着く
    expect(gathered).toMatchObject({ state: 'reacting', position: { x: 600, y: 480 }, target: null, remainingMs: REACT_MS });

    const stillReacting = stepVillager(gathered, REACT_MS - 1, rng0);
    expect(stillReacting.state).toBe('reacting');

    expect(stepVillager(stillReacting, 1, rng0)).toMatchObject({ state: 'idle', remainingMs: IDLE_MS.min });
  });
});
