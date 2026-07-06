import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {P} from '../palette';

export type Pose = 'sit' | 'stand' | 'walk' | 'think' | 'reach' | 'forward' | 'greet' | 'write';
type Facing = 'front' | 'left' | 'right' | 'back';
type Character = 'lin' | 'mother' | 'shadow';

type CharacterStyle = {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoe: string;
  accent: string;
  outline: string;
  muted: boolean;
};

export const CharacterRig: React.FC<{
  character: Character;
  pose?: Pose;
  facing?: Facing;
  x: number;
  y: number;
  scale?: number;
  enterAt?: number;
  opacity?: number;
}> = ({character, pose = 'stand', facing = 'front', x, y, scale = 1, enterAt = 0, opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - enterAt, fps, config: {damping: 18, stiffness: 90}});
  const style = getCharacterStyle(character);
  const cycle = Math.sin(frame / 5);
  const slow = Math.sin(frame / 24);
  const isSitting = pose === 'sit' || pose === 'think';
  const isWalking = pose === 'walk';
  const isWriting = pose === 'write';
  const bob = isWalking ? cycle * 5 : pose === 'think' ? slow * 2 : 0;
  const turn = facing === 'left' ? -1 : 1;
  const bodyLean = isWriting ? 12 : pose === 'reach' || pose === 'forward' ? -3 : pose === 'think' ? 3 : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob + (1 - enter) * 22,
        width: 190,
        height: 390,
        opacity: opacity * enter,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
        filter: style.muted ? 'drop-shadow(0 18px 22px rgba(36,33,29,0.10))' : 'drop-shadow(0 22px 28px rgba(36,33,29,0.15))',
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `scaleX(${turn})`, transformOrigin: 'center'}}>
        <Shadow />
        <Legs pose={pose} cycle={cycle} style={style} />
        <Body character={character} pose={pose} lean={bodyLean} style={style} />
        <Arms pose={pose} cycle={cycle} style={style} />
        <Head pose={pose} facing={facing} style={style} />
        {isSitting && <SeatLine />}
        {isWriting && <WritingProp />}
      </div>
    </div>
  );
};

const getCharacterStyle = (character: Character): CharacterStyle => {
  if (character === 'mother') {
    return {
      skin: '#E5B998',
      hair: '#2F2C28',
      top: '#D58B6E',
      bottom: '#E5C7A6',
      shoe: '#40362F',
      accent: '#F1D8B9',
      outline: P.ink,
      muted: false,
    };
  }
  if (character === 'shadow') {
    return {
      skin: '#B9B3A8',
      hair: '#5B5D57',
      top: '#8C9186',
      bottom: '#767A71',
      shoe: '#6F6257',
      accent: '#AAAFA4',
      outline: '#55564F',
      muted: true,
    };
  }
  return {
    skin: '#E0B08B',
    hair: '#202522',
    top: '#5F7F8F',
    bottom: '#263A3D',
    shoe: '#F3EFE4',
    accent: '#DCE8EA',
    outline: P.ink,
    muted: false,
  };
};

const Head: React.FC<{pose: Pose; facing: Facing; style: CharacterStyle}> = ({pose, facing, style}) => {
  const back = facing === 'back';
  const tilt = pose === 'think' ? -5 : pose === 'write' ? 8 : pose === 'greet' ? -2 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 58,
        top: pose === 'sit' || pose === 'think' ? 18 : 4,
        width: 76,
        height: 82,
        borderRadius: '46% 46% 42% 42%',
        background: back ? style.hair : style.skin,
        border: `3px solid ${style.outline}`,
        transform: `rotate(${tilt}deg)`,
        overflow: 'hidden',
      }}
    >
      {!back && (
        <>
          <div style={{position: 'absolute', left: -8, top: -10, width: 92, height: 34, borderRadius: '40% 40% 24% 24%', background: style.hair}} />
          <div style={{position: 'absolute', left: 5, top: 11, width: 26, height: 24, borderRadius: '50% 40% 45% 35%', background: style.hair, transform: 'rotate(-18deg)'}} />
          <Eye x={20} />
          <Eye x={49} />
          <div style={{position: 'absolute', left: 22, top: 39, width: 41, height: 18, borderTop: `3px solid ${style.outline}`, borderRadius: 99, opacity: 0.62}} />
          <div style={{position: 'absolute', left: 31, top: pose === 'think' ? 59 : 61, width: 18, height: 3, borderRadius: 8, background: style.outline, opacity: 0.7}} />
        </>
      )}
    </div>
  );
};

const Eye: React.FC<{x: number}> = ({x}) => (
  <div style={{position: 'absolute', left: x, top: 38, width: 7, height: 7, borderRadius: 99, background: P.ink}} />
);

const Body: React.FC<{character: Character; pose: Pose; lean: number; style: CharacterStyle}> = ({character, pose, lean, style}) => {
  const sitting = pose === 'sit' || pose === 'think';
  const mother = character === 'mother';
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: mother ? 44 : 41,
          top: sitting ? 88 : 78,
          width: mother ? 104 : 110,
          height: mother ? 214 : sitting ? 172 : 220,
          borderRadius: mother ? '42px 42px 16px 16px' : '36px 36px 30px 30px',
          background: mother ? `linear-gradient(180deg, ${style.top}, ${style.bottom})` : style.top,
          border: `3px solid ${style.outline}`,
          transform: `rotate(${lean}deg)`,
          transformOrigin: '50% 24px',
        }}
      />
      {!mother && (
        <>
          <div style={{position: 'absolute', left: 66, top: sitting ? 96 : 88, width: 16, height: 64, borderRadius: 99, background: style.accent, opacity: 0.9}} />
          <div style={{position: 'absolute', left: 108, top: sitting ? 96 : 88, width: 16, height: 64, borderRadius: 99, background: style.accent, opacity: 0.9}} />
          <div style={{position: 'absolute', left: 70, top: sitting ? 214 : 242, width: 50, height: 24, borderRadius: '0 0 18px 18px', border: `3px solid ${style.outline}`, borderTop: 0, opacity: 0.5}} />
        </>
      )}
    </>
  );
};

const Arms: React.FC<{pose: Pose; cycle: number; style: CharacterStyle}> = ({pose, cycle, style}) => {
  const left = armRotation('left', pose, cycle);
  const right = armRotation('right', pose, cycle);
  return (
    <>
      <Limb kind="arm" side="left" rotate={left.rotate} top={left.top} left={left.left} color={style.top} skin={style.skin} outline={style.outline} />
      <Limb kind="arm" side="right" rotate={right.rotate} top={right.top} left={right.left} color={style.top} skin={style.skin} outline={style.outline} />
    </>
  );
};

const Legs: React.FC<{pose: Pose; cycle: number; style: CharacterStyle}> = ({pose, cycle, style}) => {
  const sitting = pose === 'sit' || pose === 'think';
  if (pose === 'write') {
    return (
      <>
        <Leg left={58} top={292} rotate={9} color={style.bottom} shoe={style.shoe} outline={style.outline} />
        <Leg left={104} top={292} rotate={-7} color={style.bottom} shoe={style.shoe} outline={style.outline} />
      </>
    );
  }
  if (sitting) {
    return (
      <>
        <Leg left={48} top={250} rotate={76} color={style.bottom} shoe={style.shoe} outline={style.outline} short />
        <Leg left={112} top={250} rotate={-76} color={style.bottom} shoe={style.shoe} outline={style.outline} short />
      </>
    );
  }
  return (
    <>
      <Leg left={58} top={280} rotate={pose === 'walk' ? cycle * 18 : 2} color={style.bottom} shoe={style.shoe} outline={style.outline} />
      <Leg left={104} top={280} rotate={pose === 'walk' ? -cycle * 18 : -2} color={style.bottom} shoe={style.shoe} outline={style.outline} />
    </>
  );
};

const armRotation = (side: 'left' | 'right', pose: Pose, cycle: number) => {
  const leftSide = side === 'left';
  if (pose === 'walk') return {rotate: (leftSide ? -18 : 18) + (leftSide ? -cycle : cycle) * 18, left: leftSide ? 20 : 136, top: 104};
  if (pose === 'think') return {rotate: leftSide ? -10 : 46, left: leftSide ? 21 : 127, top: 105};
  if (pose === 'reach' || pose === 'forward') return {rotate: leftSide ? -22 : 78, left: leftSide ? 22 : 136, top: 102};
  if (pose === 'greet') return {rotate: leftSide ? -112 : 16, left: leftSide ? 22 : 136, top: 102};
  if (pose === 'write') return {rotate: leftSide ? 42 : -44, left: leftSide ? 44 : 111, top: 176};
  return {rotate: leftSide ? -14 : 14, left: leftSide ? 22 : 136, top: 104};
};

const Limb: React.FC<{
  kind: 'arm';
  side: 'left' | 'right';
  rotate: number;
  top: number;
  left: number;
  color: string;
  skin: string;
  outline: string;
}> = ({rotate, top, left, color, skin, outline}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 30,
      height: 132,
      borderRadius: 24,
      background: color,
      border: `3px solid ${outline}`,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: '50% 16px',
    }}
  >
    <div style={{position: 'absolute', left: 2, bottom: -14, width: 22, height: 26, borderRadius: 99, background: skin, border: `3px solid ${outline}`}} />
  </div>
);

const Leg: React.FC<{left: number; top: number; rotate: number; color: string; shoe: string; outline: string; short?: boolean}> = ({left, top, rotate, color, shoe, outline, short = false}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 34,
      height: short ? 88 : 108,
      borderRadius: 18,
      background: color,
      border: `3px solid ${outline}`,
      transform: `rotate(${rotate}deg)`,
      transformOrigin: '50% 12px',
    }}
  >
    <div style={{position: 'absolute', left: -5, bottom: -16, width: 50, height: 22, borderRadius: '18px 18px 12px 12px', background: shoe, border: `3px solid ${outline}`}} />
  </div>
);

const WritingProp: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 36, top: 346, width: 132, height: 38, borderRadius: 10, background: P.white, border: `2px solid ${P.line}`, transform: 'rotate(2deg)'}} />
    <div style={{position: 'absolute', left: 86, top: 332, width: 54, height: 8, borderRadius: 99, background: P.ink, transform: 'rotate(-24deg)', opacity: 0.8}} />
  </>
);

const SeatLine: React.FC = () => (
  <div style={{position: 'absolute', left: 36, top: 326, width: 118, height: 12, borderRadius: 99, background: 'rgba(36,33,29,0.14)'}} />
);

const Shadow: React.FC = () => (
  <div style={{position: 'absolute', left: 38, top: 366, width: 118, height: 20, borderRadius: '50%', background: 'rgba(36,33,29,0.14)'}} />
);
