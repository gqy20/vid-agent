export type TeamMemberId = 'guide' | 'analyst' | 'engineer';

export type TeamMember = {
  id: TeamMemberId;
  name: string;
  role: string;
  src: string;
  accent: string;
  short: string;
};

export const TEAM: TeamMember[] = [
  {
    id: 'guide',
    name: 'Demo Guide',
    role: '叙事导演',
    src: 'characters/demo-guide/source/demo-guide-reference_001.jpg',
    accent: '#e08560',
    short: '把需求变成镜头',
  },
  {
    id: 'analyst',
    name: 'Ops Analyst',
    role: '素材质检',
    src: 'characters/ops-analyst/source/ops-analyst-front_001.jpg',
    accent: '#8fbdb6',
    short: '筛选人物与场景',
  },
  {
    id: 'engineer',
    name: 'Motion Engineer',
    role: '动画装配',
    src: 'characters/motion-engineer/source/motion-engineer-front_001.jpg',
    accent: '#ce9646',
    short: '接入 Remotion 时间线',
  },
];

export const GUIDE_DIRECTIONS = [
  {id: 's', label: 'S', src: 'characters/demo-guide/directions/demo-guide-s_001.jpg'},
  {id: 'sw', label: 'SW', src: 'characters/demo-guide/directions/demo-guide-sw_001.jpg'},
  {id: 'w', label: 'W', src: 'characters/demo-guide/directions/demo-guide-w_001.jpg'},
  {id: 'nw', label: 'NW', src: 'characters/demo-guide/directions/demo-guide-nw_001.jpg'},
  {id: 'n', label: 'N', src: 'characters/demo-guide/directions/demo-guide-n_001.jpg'},
  {id: 'ne', label: 'NE', src: 'characters/demo-guide/directions/demo-guide-ne_001.jpg'},
  {id: 'e', label: 'E', src: 'characters/demo-guide/directions/demo-guide-e_001.jpg'},
  {id: 'se', label: 'SE', src: 'characters/demo-guide/directions/demo-guide-se_001.jpg'},
] as const;

export const BEATS = [
  '生成角色',
  '统一资产协议',
  '接入时间线',
  '逐帧抽检',
  '导出成片',
] as const;
