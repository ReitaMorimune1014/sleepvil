import { Group, Path, Rect, RoundedRect } from '@shopify/react-native-skia';

import type { BuildingRect } from '../domain/buildings';
import { domePath, gableRoofPath, hipRoofPath, windowGrid } from './buildingParts';
import { DOOR_COLOR, ERA_BUILDING_COLORS, ERA_ROOF_COLORS, WINDOW_COLOR } from './theme';

type Props = {
  rect: BuildingRect;
  eraIndex: number;
};

/** 時代ごとに形を変えた建物。rect は建物全体の外枠(下端が地面) */
export function BuildingShape({ rect, eraIndex }: Props) {
  const { x, y, width: w, height: h } = rect;
  const left = x;
  const right = x + w;
  const bottom = y + h;
  const wall = ERA_BUILDING_COLORS[eraIndex] ?? ERA_BUILDING_COLORS[0];
  const roof = ERA_ROOF_COLORS[eraIndex] ?? ERA_ROOF_COLORS[0];
  const door = <Rect x={x + w * 0.42} y={bottom - h * 0.28} width={w * 0.16} height={h * 0.28} color={DOOR_COLOR} />;

  switch (eraIndex) {
    case 0: {
      // 先史: 低い土壁に、大きなわらぶきの三角屋根
      const wallTop = y + h * 0.55;
      return (
        <Group>
          <Rect x={left + w * 0.1} y={wallTop} width={w * 0.8} height={bottom - wallTop} color={wall} />
          <Path path={gableRoofPath(left, right, y, wallTop + h * 0.1, w * 0.05)} color={roof} />
          {door}
        </Group>
      );
    }
    case 1: {
      // 古代: 石の建物に、柱と三角の破風
      const wallTop = y + h * 0.25;
      const columns = [0.12, 0.34, 0.56, 0.78].map((p) => x + w * p);
      return (
        <Group>
          <Path path={gableRoofPath(left, right, y, wallTop, w * 0.04)} color={roof} />
          <Rect x={left} y={wallTop} width={w} height={bottom - wallTop} color={roof} />
          {columns.map((cx, i) => (
            <Rect key={i} x={cx} y={wallTop} width={w * 0.1} height={bottom - wallTop} color={wall} />
          ))}
        </Group>
      );
    }
    case 2: {
      // 中世: 城壁の凸凹と、アーチの扉
      const merlonW = w / 7;
      return (
        <Group>
          <Rect x={left} y={y + h * 0.12} width={w} height={h * 0.88} color={wall} />
          {[0, 2, 4, 6].map((i) => (
            <Rect key={i} x={left + merlonW * i} y={y} width={merlonW} height={h * 0.13} color={wall} />
          ))}
          <RoundedRect x={x + w * 0.38} y={bottom - h * 0.35} width={w * 0.24} height={h * 0.35} r={w * 0.12} color={DOOR_COLOR} />
        </Group>
      );
    }
    case 3: {
      // 近世: 白壁に、横に広い瓦屋根
      const wallTop = y + h * 0.38;
      return (
        <Group>
          <Rect x={left + w * 0.06} y={wallTop} width={w * 0.88} height={bottom - wallTop} color={wall} />
          <Path path={hipRoofPath(left, right, y, wallTop, w * 0.18, w * 0.06)} color={roof} />
          {windowGrid({ x: left + w * 0.06, y: wallTop, width: w * 0.88, height: h * 0.25 }, 3, 1, w * 0.06).map((r, i) => (
            <Rect key={i} {...r} color={DOOR_COLOR} opacity={0.5} />
          ))}
          {door}
        </Group>
      );
    }
    case 4: {
      // 近代: れんがの家に、煙突と縦長の窓
      const wallTop = y + h * 0.22;
      return (
        <Group>
          <Rect x={left + w * 0.68} y={y} width={w * 0.1} height={h * 0.2} color={roof} />
          <Path path={gableRoofPath(left, right, y + h * 0.04, wallTop, w * 0.04)} color={roof} />
          <Rect x={left} y={wallTop} width={w} height={bottom - wallTop} color={wall} />
          {windowGrid({ x: left, y: wallTop, width: w, height: h * 0.45 }, 2, 2, w * 0.1).map((r, i) => (
            <Rect key={i} {...r} color={WINDOW_COLOR} />
          ))}
          {door}
        </Group>
      );
    }
    case 5:
      // 現代: 窓が並ぶビル
      return (
        <Group>
          <Rect x={left} y={y} width={w} height={h} color={wall} />
          <Rect x={left} y={y} width={w} height={h * 0.05} color={roof} />
          {windowGrid({ x: left, y: y + h * 0.05, width: w, height: h * 0.68 }, 3, 5, w * 0.07).map((r, i) => (
            <Rect key={i} {...r} color={WINDOW_COLOR} />
          ))}
          <Rect x={x + w * 0.35} y={bottom - h * 0.2} width={w * 0.3} height={h * 0.2} color={DOOR_COLOR} />
        </Group>
      );
    default: {
      // 未来: ガラスの胴体に、ドームとアンテナ
      const domeBottom = y + h * 0.4;
      return (
        <Group>
          <Rect x={x + w * 0.49} y={y} width={w * 0.02} height={h * 0.12} color={roof} />
          <Path path={domePath(left + w * 0.1, right - w * 0.1, domeBottom)} color={roof} opacity={0.85} />
          <RoundedRect x={left} y={domeBottom} width={w} height={bottom - domeBottom} r={w * 0.08} color={wall} />
          {windowGrid({ x: left, y: domeBottom, width: w, height: h * 0.35 }, 4, 1, w * 0.06).map((r, i) => (
            <Rect key={i} {...r} color={roof} opacity={0.6} />
          ))}
        </Group>
      );
    }
  }
}
