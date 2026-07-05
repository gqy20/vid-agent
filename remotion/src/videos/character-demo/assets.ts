import type {CharacterDirection, CharacterPose} from '../../components/CharacterSprite';

export const CHARACTER_NAME = 'Demo Guide';

export const DIRECTIONS: CharacterDirection[] = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];

export const POSES: Record<CharacterDirection, CharacterPose> = {
  s: {
    direction: 's',
    src: 'characters/demo-guide/directions/demo-guide-s_001.jpg',
  },
  sw: {
    direction: 'sw',
    src: 'characters/demo-guide/directions/demo-guide-sw_001.jpg',
  },
  w: {
    direction: 'w',
    src: 'characters/demo-guide/directions/demo-guide-w_001.jpg',
  },
  nw: {
    direction: 'nw',
    src: 'characters/demo-guide/directions/demo-guide-nw_001.jpg',
  },
  n: {
    direction: 'n',
    src: 'characters/demo-guide/directions/demo-guide-n_001.jpg',
  },
  ne: {
    direction: 'ne',
    src: 'characters/demo-guide/directions/demo-guide-ne_001.jpg',
  },
  e: {
    direction: 'e',
    src: 'characters/demo-guide/directions/demo-guide-e_001.jpg',
  },
  se: {
    direction: 'se',
    src: 'characters/demo-guide/directions/demo-guide-se_001.jpg',
  },
};
