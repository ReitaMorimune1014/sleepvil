import { Circle, Group, Line, RoundedRect, vec } from '@shopify/react-native-skia';

import { VILLAGER_HEIGHT, VILLAGER_WIDTH } from '../config/villagers';
import { depthScale, jumpOffset } from '../domain/village';
import type { Villager } from '../domain/villager';
import { villagerPose } from './pose';
import { VILLAGER_BODY_COLOR, VILLAGER_EYE_COLOR, VILLAGER_HEAD_COLOR, VILLAGER_LIMB_COLOR } from './theme';

type Props = {
  villager: Villager;
  /** 起きなかった日が続いて、村人が待っている */
  waiting: boolean;
};

/**
 * 村人1人分の図形(頭・体・腕・脚)。position は足元で、奥ほど小さく描く。
 * 歩くと脚を振り、喜ぶと跳ねて両手を上げ、待っているときは空を見上げる。
 */
export function VillagerShape({ villager, waiting }: Props) {
  const pose = villagerPose(villager, waiting);
  const s = depthScale(villager.position.y);
  const w = VILLAGER_WIDTH * s;
  const h = VILLAGER_HEIGHT * s;
  const cx = villager.position.x;
  const feetY = villager.position.y - jumpOffset(villager);

  // 体の各部の位置(全体の高さ h を、脚3割・体7割に分ける)
  const legLength = h * 0.3;
  const hipY = feetY - legLength;
  const bodyTop = feetY - h;
  const shoulderY = bodyTop + h * 0.15;
  const armLength = h * 0.35;
  const headRadius = w * 0.42;
  const headY = bodyTop - headRadius * (pose.lookUp ? 1.25 : 0.9);
  const limb = { color: VILLAGER_LIMB_COLOR, strokeWidth: Math.max(2, w * 0.18), strokeCap: 'round' as const };

  // 脚は左右逆向きに振る。腕は喜ぶときだけ上に向ける
  const legDx = pose.legSwing * legLength * 0.6;
  const armDy = pose.armsUp ? -armLength : armLength * 0.8;
  const armDx = armLength * 0.5;

  return (
    <Group>
      <Line p1={vec(cx, hipY)} p2={vec(cx + legDx, feetY)} {...limb} />
      <Line p1={vec(cx, hipY)} p2={vec(cx - legDx, feetY)} {...limb} />
      <Line p1={vec(cx, shoulderY)} p2={vec(cx - armDx, shoulderY + armDy)} {...limb} />
      <Line p1={vec(cx, shoulderY)} p2={vec(cx + armDx, shoulderY + armDy)} {...limb} />
      <RoundedRect x={cx - w / 2} y={bodyTop} width={w} height={hipY - bodyTop} r={w * 0.3} color={VILLAGER_BODY_COLOR} />
      <Circle cx={cx} cy={headY} r={headRadius} color={VILLAGER_HEAD_COLOR} />
      {/* 目は向いている方に寄せ、見上げているときは上に寄せる */}
      <Circle
        cx={cx + pose.facing * headRadius * 0.45}
        cy={headY - headRadius * (pose.lookUp ? 0.45 : 0.05)}
        r={Math.max(1, headRadius * 0.16)}
        color={VILLAGER_EYE_COLOR}
      />
    </Group>
  );
}
