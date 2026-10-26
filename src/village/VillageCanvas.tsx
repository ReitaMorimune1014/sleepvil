import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FIELDS, GROUND_FAR_Y, WORLD_HEIGHT, WORLD_WIDTH } from '../config/villagers';
import { buildingRects } from '../domain/buildings';
import type { GuiltLevel } from '../domain/streak';
import { sortByDepth } from '../domain/village';
import type { Villager } from '../domain/villager';
import { BuildingShape } from './BuildingShape';
import { Clouds, Hills, Mountains, Sky, Trees } from './Scenery';
import {
  FIELD_COLOR,
  FIELD_ROW_COLOR,
  FIELD_WILTED_COLOR,
  FIELD_WILTED_ROW_COLOR,
  GROUND_COLOR,
  GROUND_WILTED_COLOR,
} from './theme';
import { VillagerShape } from './VillagerShape';

type Props = {
  width: number;
  height: number;
  eraIndex: number;
  buildingStage: number;
  villagers: readonly Villager[];
  /** 起きなかった日が続いたときの見た目の変化 */
  guilt: GuiltLevel;
};

/** 畑の畝の本数 */
const FIELD_ROWS = 3;

/**
 * 村を1つのキャンバスに描く。横にスワイプすると村を見渡せる。
 * 遠くの層ほどゆっくり動かして奥行きを出す(視差スクロール)。
 */
export function VillageCanvas({ width, height, eraIndex, buildingStage, villagers, guilt }: Props) {
  // 世界座標 → 画面のピクセルへの倍率(高さを画面に合わせる)
  const scale = height / WORLD_HEIGHT;
  const worldPx = WORLD_WIDTH * scale;
  const initialScrollX = Math.max(0, (worldPx - width) / 2);
  const [scrollX, setScrollX] = useState(initialScrollX);

  // 層ごとに、スクロール量に掛ける係数を変える(0 = 動かない、1 = 地面と同じ速さ)
  const layer = (factor: number) => [{ translateX: -scrollX * factor }, { scale }];
  // 見た目だけを変える(ポイントや建物は減らさない)
  const wilted = guilt !== 'none';

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Sky width={width} height={height} />
        <Group transform={layer(0.15)}>
          <Clouds />
        </Group>
        <Group transform={layer(0.3)}>
          <Mountains />
        </Group>
        <Group transform={layer(0.6)}>
          <Hills />
        </Group>
        <Group transform={layer(1)}>
          <Rect
            x={0}
            y={GROUND_FAR_Y}
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT - GROUND_FAR_Y}
            color={wilted ? GROUND_WILTED_COLOR : GROUND_COLOR}
          />
          <Trees />
          {FIELDS.map((r, i) => (
            <Group key={i}>
              <Rect {...r} color={wilted ? FIELD_WILTED_COLOR : FIELD_COLOR} />
              {Array.from({ length: FIELD_ROWS }, (_, row) => (
                <Rect
                  key={row}
                  x={r.x + 6}
                  y={r.y + ((row + 0.5) * r.height) / FIELD_ROWS - 2}
                  width={r.width - 12}
                  height={4}
                  color={wilted ? FIELD_WILTED_ROW_COLOR : FIELD_ROW_COLOR}
                />
              ))}
            </Group>
          ))}
          {buildingRects(eraIndex, buildingStage).map((r, i) => (
            <BuildingShape key={i} rect={r} eraIndex={eraIndex} />
          ))}
          {/* 奥の村人から先に描き、手前の村人が上に重なるようにする */}
          {sortByDepth(villagers).map((v) => (
            <VillagerShape key={v.id} villager={v} waiting={guilt === 'waiting'} />
          ))}
        </Group>
      </Canvas>

      {/* 透明なスクロール領域を重ね、スワイプ量だけを受け取る */}
      <ScrollView
        style={StyleSheet.absoluteFill}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: initialScrollX, y: 0 }}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
      >
        <View style={{ width: worldPx, height }} />
      </ScrollView>
    </View>
  );
}
