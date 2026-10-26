import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { GROUND_FAR_Y, WORLD_HEIGHT, WORLD_WIDTH } from '../config/villagers';
import { buildingRects } from '../domain/buildings';
import { ERA_BUILDING_COLORS, FAR_MOUNTAIN_COLOR, GROUND_COLOR, MID_HILL_COLOR, SKY_COLOR } from './theme';

type Props = {
  width: number;
  height: number;
  eraIndex: number;
  buildingStage: number;
};

/** 遠景・中景の四角形(世界座標)。当面のプレースホルダー */
const FAR_MOUNTAINS = [0, 300, 600, 900].map((x, i) => ({ x, y: 220 + (i % 2) * 40, width: 320, height: 200 }));
const MID_HILLS = [0, 250, 500, 750, 1000].map((x, i) => ({ x, y: 320 + (i % 2) * 20, width: 280, height: 80 }));

/**
 * 村を1つのキャンバスに描く。横にスワイプすると村を見渡せる。
 * 遠くの層ほどゆっくり動かして奥行きを出す(視差スクロール)。
 */
export function VillageCanvas({ width, height, eraIndex, buildingStage }: Props) {
  // 世界座標 → 画面のピクセルへの倍率(高さを画面に合わせる)
  const scale = height / WORLD_HEIGHT;
  const worldPx = WORLD_WIDTH * scale;
  const initialScrollX = Math.max(0, (worldPx - width) / 2);
  const [scrollX, setScrollX] = useState(initialScrollX);

  // 層ごとに、スクロール量に掛ける係数を変える(0 = 動かない、1 = 地面と同じ速さ)
  const layer = (factor: number) => [{ translateX: -scrollX * factor }, { scale }];
  const buildingColor = ERA_BUILDING_COLORS[eraIndex] ?? ERA_BUILDING_COLORS[0];

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
          <Rect x={0} y={GROUND_FAR_Y} width={WORLD_WIDTH} height={WORLD_HEIGHT - GROUND_FAR_Y} color={GROUND_COLOR} />
          {buildingRects(eraIndex, buildingStage).map((r, i) => (
            <Rect key={i} {...r} color={buildingColor} />
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
