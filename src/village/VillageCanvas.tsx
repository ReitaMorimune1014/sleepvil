import { Canvas, Circle, Group, Rect } from '@shopify/react-native-skia';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  FIELDS,
  GROUND_FAR_Y,
  VILLAGER_HEIGHT,
  VILLAGER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../config/villagers';
import { buildingRects } from '../domain/buildings';
import type { GuiltLevel } from '../domain/streak';
import { depthScale, jumpOffset, sortByDepth } from '../domain/village';
import type { Villager } from '../domain/villager';
import {
  ERA_BUILDING_COLORS,
  FAR_MOUNTAIN_COLOR,
  FIELD_COLOR,
  FIELD_WILTED_COLOR,
  GROUND_COLOR,
  GROUND_WILTED_COLOR,
  MID_HILL_COLOR,
  SKY_COLOR,
  VILLAGER_BODY_COLOR,
  VILLAGER_HEAD_COLOR,
} from './theme';

type Props = {
  width: number;
  height: number;
  eraIndex: number;
  buildingStage: number;
  villagers: readonly Villager[];
  /** 起きなかった日が続いたときの見た目の変化 */
  guilt: GuiltLevel;
};

/**
 * 村人1人分の図形。position は足元で、奥ほど小さく、喜ぶときは跳ねる。
 * lookUp なら、頭を体から少し離して空を見上げているように見せる。
 */
function VillagerShape({ villager, lookUp }: { villager: Villager; lookUp: boolean }) {
  const s = depthScale(villager.position.y);
  const w = VILLAGER_WIDTH * s;
  const h = VILLAGER_HEIGHT * s;
  const top = villager.position.y - h - jumpOffset(villager);
  const headRadius = w * 0.4;
  const neck = lookUp ? headRadius * 0.6 : 0;
  return (
    <Group>
      <Rect x={villager.position.x - w / 2} y={top} width={w} height={h} color={VILLAGER_BODY_COLOR} />
      <Circle cx={villager.position.x} cy={top - headRadius - neck} r={headRadius} color={VILLAGER_HEAD_COLOR} />
    </Group>
  );
}

/** 遠景・中景の四角形(世界座標)。当面のプレースホルダー */
const FAR_MOUNTAINS = [0, 300, 600, 900].map((x, i) => ({ x, y: 220 + (i % 2) * 40, width: 320, height: 200 }));
const MID_HILLS = [0, 250, 500, 750, 1000].map((x, i) => ({ x, y: 320 + (i % 2) * 20, width: 280, height: 80 }));

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
  const buildingColor = ERA_BUILDING_COLORS[eraIndex] ?? ERA_BUILDING_COLORS[0];
  // 見た目だけを変える(ポイントや建物は減らさない)
  const wilted = guilt !== 'none';

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Rect x={0} y={0} width={width} height={height} color={SKY_COLOR} />
        <Group transform={layer(0.3)}>
          {FAR_MOUNTAINS.map((r, i) => (
            <Rect key={i} {...r} color={FAR_MOUNTAIN_COLOR} />
          ))}
        </Group>
        <Group transform={layer(0.6)}>
          {MID_HILLS.map((r, i) => (
            <Rect key={i} {...r} color={MID_HILL_COLOR} />
          ))}
        </Group>
        <Group transform={layer(1)}>
          <Rect
            x={0}
            y={GROUND_FAR_Y}
            width={WORLD_WIDTH}
            height={WORLD_HEIGHT - GROUND_FAR_Y}
            color={wilted ? GROUND_WILTED_COLOR : GROUND_COLOR}
          />
          {FIELDS.map((r, i) => (
            <Rect key={i} {...r} color={wilted ? FIELD_WILTED_COLOR : FIELD_COLOR} />
          ))}
          {buildingRects(eraIndex, buildingStage).map((r, i) => (
            <Rect key={i} {...r} color={buildingColor} />
          ))}
          {/* 奥の村人から先に描き、手前の村人が上に重なるようにする */}
          {sortByDepth(villagers).map((v) => (
            <VillagerShape key={v.id} villager={v} lookUp={guilt === 'waiting'} />
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
