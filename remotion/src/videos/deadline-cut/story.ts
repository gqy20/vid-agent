import {P} from './palette';

export type ChapterKind =
  | 'opening'
  | 'board'
  | 'audit'
  | 'director'
  | 'conflict'
  | 'repair'
  | 'turning'
  | 'rewrite'
  | 'collab'
  | 'finalFrames'
  | 'delivery'
  | 'epilogue';

export type Chapter = {
  id: ChapterKind;
  chapter: string;
  title: string;
  kicker: string;
  voiceover: string;
  dialogue?: string[];
  plate?: string;
  accent: string;
  conflict: 1 | 2 | 3 | 4 | 5;
};

export const CHAPTERS: Chapter[] = [
  {
    id: 'opening',
    chapter: '01',
    title: '倒计时启动',
    kicker: '48:00:00',
    voiceover: '凌晨两点，屏幕上的倒计时像一把悬着的刀，提醒他们：这次不能只做技术验证。',
    plate: 'deadline-cut/story-plates/editorial-editing-room_001.jpg',
    accent: P.clay,
    conflict: 1,
  },
  {
    id: 'board',
    chapter: '02',
    title: '八向图的代价',
    kicker: '角色转身',
    voiceover: '阿程把八个方向排成一张表。每一帧都能用，但连起来，角色就像失去了呼吸。',
    dialogue: ['阿程：再给我两个小时，这个转身一定能顺。'],
    accent: P.brass,
    conflict: 2,
  },
  {
    id: 'audit',
    chapter: '03',
    title: '质检员的质疑',
    kicker: '发现问题',
    voiceover: '小析戴上耳机，一帧帧回放。帽子、裁切、水印和下巴角度，都在提醒她不能放过。',
    dialogue: ['小析：这不是瑕疵，是观众会看见的断点。'],
    plate: 'deadline-cut/story-plates/frame-audit-desk_001.jpg',
    accent: P.sage,
    conflict: 3,
  },
  {
    id: 'director',
    chapter: '04',
    title: '导演的坚持',
    kicker: '标准',
    voiceover: '阿导没有急着否定任何人。他只问了一个问题：如果角色站不住，故事从哪里开始？',
    dialogue: ['阿导：不是差不多。角色是故事的入口。'],
    accent: P.clay,
    conflict: 3,
  },
  {
    id: 'conflict',
    chapter: '05',
    title: '时间出现裂痕',
    kicker: '冲突',
    voiceover: '三个人站在同一块屏幕前。每个人都对，却没有一个答案能让片子准时交出去。',
    dialogue: ['阿程：我做了三天。', '小析：三天也救不了坏掉的关节。', '阿导：那就别只修关节。'],
    accent: P.oxide,
    conflict: 4,
  },
  {
    id: 'repair',
    chapter: '06',
    title: '错误的修复',
    kicker: '越改越乱',
    voiceover: '阿程删掉一帧，又补上一帧。动作看似更平滑，情绪却越来越空。',
    dialogue: ['阿程：为什么顺了，反而更不像一个角色？'],
    accent: P.oxide,
    conflict: 4,
  },
  {
    id: 'turning',
    chapter: '07',
    title: '灵感来自坏帧',
    kicker: '转折',
    voiceover: '就在他们准备重来时，阿导注意到那个歪头角度。它不像错误，倒像是在倾听。',
    dialogue: ['阿导：等等，它不是在转身，它是在听。'],
    plate: 'deadline-cut/story-plates/listening-turning-point_001.jpg',
    accent: P.brass,
    conflict: 2,
  },
  {
    id: 'rewrite',
    chapter: '08',
    title: '重新诠释角色',
    kicker: '故事化',
    voiceover: '那一刻，不完美变成了性格。他们不再抹掉坏帧，而是重写角色存在的理由。',
    dialogue: ['小析：它是在等人开口。', '阿程：所以它才会歪着头。'],
    accent: P.sage,
    conflict: 2,
  },
  {
    id: 'collab',
    chapter: '09',
    title: '真正的协作开始',
    kicker: '冲刺',
    voiceover: '分工没有消失，但边界被打破。阿程画，小析挑，阿导定调，三个人终于在做同一件事。',
    dialogue: ['阿导：把等待做进去。', '小析：呼吸节奏慢半拍。'],
    accent: P.sage,
    conflict: 3,
  },
  {
    id: 'finalFrames',
    chapter: '10',
    title: '最后一帧落定',
    kicker: '完成',
    voiceover: '窗外开始发白。八向图仍然不完美，但角色第一次像是真的知道自己在等谁。',
    dialogue: ['阿程：成了。'],
    accent: P.brass,
    conflict: 1,
  },
  {
    id: 'delivery',
    chapter: '11',
    title: '截止前交付',
    kicker: 'Deadline',
    voiceover: '倒计时归零前，他们点击提交。那一帧曾经的问题，成了整条片子的灵魂。',
    plate: 'deadline-cut/story-plates/delivery-morning_001.jpg',
    accent: P.clay,
    conflict: 1,
  },
  {
    id: 'epilogue',
    chapter: '12',
    title: '留下来的不是完美',
    kicker: '画外音',
    voiceover: '真正的小故事，常常藏在那些你以为必须修掉的地方。完美很干净，不完美才会呼吸。',
    accent: P.brass,
    conflict: 1,
  },
];

export const VOICEOVER = CHAPTERS.map((chapter) => chapter.voiceover).join('\n\n');
