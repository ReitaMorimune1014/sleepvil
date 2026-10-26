import { Circle, Group, LinearGradient, Oval, Path, Rect, vec } from '@shopify/react-native-skia';

import { depthScale } from '../domain/village';
import { CLOUDS, HILLS, MOUNTAINS, TREES, mountainPath, snowCapPath } from './sceneryData';
import {
  CLOUD_COLOR,
  FAR_MOUNTAIN_COLOR,
  FAR_MOUNTAIN_COLOR_2,
  MID_HILL_COLOR,
  MID_HILL_COLOR_2,
  SKY_BOTTOM_COLOR,
  SKY_TOP_COLOR,
  SNOW_COLOR,
  TREE_CROWN_COLOR,
  TREE_TRUNK_COLOR,
} from './theme';

/** 空のグラデーション(画面のピクセル座標で描く。スクロールしない) */
export function Sky({ width, height }: { width: number; height: number }) {
  return (
    <Rect x={0} y={0} width={width} height={height}>
      <LinearGradient start={vec(0, 0)} end={vec(0, height)} colors={[SKY_TOP_COLOR, SKY_BOTTOM_COLOR]} />
    </Rect>
  );
}

export function Clouds() {
  return (
    <Group>
      {CLOUDS.map((c, i) => (
        <Group key={i}>
          <Circle cx={c.cx - c.r} cy={c.cy + c.r * 0.3} r={c.r * 0.75} color={CLOUD_COLOR} />
          <Circle cx={c.cx} cy={c.cy} r={c.r} color={CLOUD_COLOR} />
          <Circle cx={c.cx + c.r} cy={c.cy + c.r * 0.3} r={c.r * 0.7} color={CLOUD_COLOR} />
        </Group>
      ))}
    </Group>
  );
}

export function Mountains() {
  return (
    <Group>
      {MOUNTAINS.map((m, i) => (
        <Group key={i}>
          <Path path={mountainPath(m)} color={i % 2 === 0 ? FAR_MOUNTAIN_COLOR : FAR_MOUNTAIN_COLOR_2} />
          <Path path={snowCapPath(m)} color={SNOW_COLOR} />
        </Group>
      ))}
    </Group>
  );
}

export function Hills() {
  return (
    <Group>
      {HILLS.map((h, i) => (
        <Oval key={i} {...h} color={i % 2 === 0 ? MID_HILL_COLOR : MID_HILL_COLOR_2} />
      ))}
    </Group>
  );
}

/** 木(幹+丸い葉)。奥にあるほど小さく描く */
export function Trees() {
  return (
    <Group>
      {TREES.map((t, i) => {
        const s = depthScale(t.y) * 1.2;
        return (
          <Group key={i}>
            <Rect x={t.x - 5 * s} y={t.y - 30 * s} width={10 * s} height={30 * s} color={TREE_TRUNK_COLOR} />
            <Circle cx={t.x} cy={t.y - 44 * s} r={22 * s} color={TREE_CROWN_COLOR} />
            <Circle cx={t.x - 12 * s} cy={t.y - 32 * s} r={14 * s} color={TREE_CROWN_COLOR} />
            <Circle cx={t.x + 12 * s} cy={t.y - 32 * s} r={14 * s} color={TREE_CROWN_COLOR} />
          </Group>
        );
      })}
    </Group>
  );
}
