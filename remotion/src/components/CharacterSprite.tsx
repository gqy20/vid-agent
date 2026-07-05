import {Img, staticFile} from 'remotion';

export type CharacterDirection = 's' | 'sw' | 'w' | 'nw' | 'n' | 'ne' | 'e' | 'se';

export type CharacterPose = {
  direction: CharacterDirection;
  src: string;
};

const DIRECTION_LABELS: Record<CharacterDirection, string> = {
  s: 'S',
  sw: 'SW',
  w: 'W',
  nw: 'NW',
  n: 'N',
  ne: 'NE',
  e: 'E',
  se: 'SE',
};

export const getDirectionLabel = (direction: CharacterDirection) =>
  DIRECTION_LABELS[direction];

export const CharacterSprite: React.FC<{
  pose: CharacterPose;
  size?: number;
  mirror?: boolean;
  style?: React.CSSProperties;
}> = ({pose, size = 360, mirror = false, style}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Img
        src={staticFile(pose.src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: mirror ? 'scaleX(-1)' : undefined,
        }}
      />
    </div>
  );
};
