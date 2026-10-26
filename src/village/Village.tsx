import { useEffect } from 'react';

import { villagerCount } from '../domain/village';
import { useVillageLoop } from './useVillageLoop';
import { VillageCanvas } from './VillageCanvas';

type Props = {
  width: number;
  height: number;
  eraIndex: number;
  buildingStage: number;
  /** true なら表示した直後に村人を集めて喜ばせ、onCelebrated を呼ぶ */
  celebrate: boolean;
  onCelebrated: () => void;
};

/**
 * 動く村。ループの状態はこの部品の中だけで持ち、30fps の再描画がホーム画面全体に広がらないようにする。
 */
export function Village({ width, height, eraIndex, buildingStage, celebrate, onCelebrated }: Props) {
  const { villagers, celebrate: startCelebration } = useVillageLoop(villagerCount(eraIndex));

  useEffect(() => {
    if (celebrate) {
      startCelebration();
      onCelebrated();
    }
  }, [celebrate, startCelebration, onCelebrated]);

  return (
    <VillageCanvas
      width={width}
      height={height}
      eraIndex={eraIndex}
      buildingStage={buildingStage}
      villagers={villagers}
    />
  );
}
