import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { VILLAGE_FPS } from '../config/villagers';
import { resizeVillagers } from '../domain/village';
import { startReaction, stepVillager, type Villager } from '../domain/villager';

const FRAME_MS = 1000 / VILLAGE_FPS;
/** アプリに戻った直後などに、1回で大きく進みすぎないようにする上限 */
const MAX_STEP_MS = 100;

/**
 * 村人を動かすループ。30fps に間引いて状態を進める。
 * アプリが裏に回っている間と、この画面が表示されていない間(アンマウント後)はループを止める。
 * paused の間も止める(村人がその場で立ち止まって待つ)。
 */
export function useVillageLoop(count: number, paused: boolean) {
  const [villagers, setVillagers] = useState<Villager[]>(() => resizeVillagers([], count, Math.random));
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  // 時代が進んで人数が変わったら、そろえる
  useEffect(() => {
    setVillagers((vs) => resizeVillagers(vs, count, Math.random));
  }, [count]);

  // アプリが前面にあるかどうかを見張る
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!appActive || paused) {
      return;
    }
    let frameId = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const elapsed = now - last;
      // 画面の描き換え(多くは60回/秒)のうち、30fps 分だけ状態を進める
      if (elapsed >= FRAME_MS) {
        last = now;
        const dt = Math.min(elapsed, MAX_STEP_MS);
        setVillagers((vs) => vs.map((v) => stepVillager(v, dt, Math.random)));
      }
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [appActive, paused]);

  /** 全員を集合させて喜ばせる */
  const celebrate = useCallback(() => {
    setVillagers((vs) => vs.map(startReaction));
  }, []);

  return { villagers, celebrate };
}
