import {P} from '../palette';
import type {DirectionKey} from './directions';

export type ActorId = 'director' | 'analyst' | 'engineer';

export type ActorManifest = {
  id: ActorId;
  name: string;
  role: string;
  accent: string;
  fallbackDirection: DirectionKey;
  directions: Partial<Record<DirectionKey, string>>;
  candidateDirectionSheet?: string;
  candidateStatus?: 'accepted' | 'needs-regeneration';
  candidateNotes?: string;
};

export const ACTORS: Record<ActorId, ActorManifest> = {
  director: {
    id: 'director',
    name: '阿导',
    role: '导演',
    accent: P.clay,
    fallbackDirection: 'S',
    directions: {
      N: 'characters/demo-guide/directions/demo-guide-n_001.jpg',
      NE: 'characters/demo-guide/directions/demo-guide-ne_001.jpg',
      E: 'characters/demo-guide/directions/demo-guide-e_001.jpg',
      SE: 'characters/demo-guide/directions/demo-guide-se_001.jpg',
      S: 'characters/demo-guide/directions/demo-guide-s_001.jpg',
      SW: 'characters/demo-guide/directions/demo-guide-sw_001.jpg',
      W: 'characters/demo-guide/directions/demo-guide-w_001.jpg',
      NW: 'characters/demo-guide/directions/demo-guide-nw_001.jpg',
    },
  },
  analyst: {
    id: 'analyst',
    name: '小析',
    role: '质检',
    accent: P.sage,
    fallbackDirection: 'S',
    directions: {
      S: 'characters/ops-analyst/source/ops-analyst-front_001.jpg',
    },
    candidateDirectionSheet: 'characters/ops-analyst/directions16/contact-sheet.jpg',
    candidateStatus: 'needs-regeneration',
    candidateNotes: '16-way candidate has usable turn intent but identity and outfit drift between directions.',
  },
  engineer: {
    id: 'engineer',
    name: '阿程',
    role: '动画',
    accent: P.brass,
    fallbackDirection: 'S',
    directions: {
      S: 'characters/motion-engineer/source/motion-engineer-front_001.jpg',
    },
    candidateDirectionSheet: 'characters/motion-engineer/directions16/contact-sheet.jpg',
    candidateStatus: 'needs-regeneration',
    candidateNotes: '16-way candidate has severe identity drift; sheet candidate is consistent but lacks clear direction change.',
  },
};
