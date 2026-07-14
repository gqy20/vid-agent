import {seconds} from '../timeline';

export const EP01_SCENES = [
  {id: 'hook', title: '开场', duration: seconds(8)},
  {id: 'install', title: '安装与配置', duration: seconds(80)},
  {id: 'takeaway', title: '收尾', duration: seconds(8)},
] as const;

export const EP01_DURATION_IN_FRAMES = EP01_SCENES.reduce((sum, scene) => sum + scene.duration, 0);
