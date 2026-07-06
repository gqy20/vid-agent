export type CastId = 'director' | 'analyst' | 'engineer';

export type CastMember = {
  id: CastId;
  name: string;
  role: string;
  src: string;
  accent: string;
  line: string;
};

export const CAST: CastMember[] = [
  {
    id: 'director',
    name: '阿导',
    role: '导演',
    src: 'characters/demo-guide/source/demo-guide-reference_001.jpg',
    accent: '#bf7658',
    line: '先别做功能演示，先让它像个故事。',
  },
  {
    id: 'analyst',
    name: '小析',
    role: '质检',
    src: 'characters/ops-analyst/source/ops-analyst-front_001.jpg',
    accent: '#7e978a',
    line: '八向图不一致，帽子、水印、裁切都要标出来。',
  },
  {
    id: 'engineer',
    name: '阿程',
    role: '动画',
    src: 'characters/motion-engineer/source/motion-engineer-front_001.jpg',
    accent: '#b29259',
    line: '我先把可用帧接进时间线，今晚能交第一版。',
  },
];

export const BAD_FRAMES = [
  {label: '帽子漂移', src: 'characters/demo-guide/directions/demo-guide-ne_001.jpg'},
  {label: '裁切过近', src: 'characters/demo-guide/directions/demo-guide-nw_001.jpg'},
  {label: '方向可用', src: 'characters/demo-guide/directions/demo-guide-s_001.jpg'},
] as const;

export const BOARD_CARDS = [
  '开场：任务来了',
  '三人接单',
  '素材翻车',
  '救场剪辑',
  'current 输出',
] as const;
