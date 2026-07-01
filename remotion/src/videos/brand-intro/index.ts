import {BrandIntro} from './BrandIntro';
import type {VideoRegistration} from '../types';

export const registration: VideoRegistration = {
  slug: 'brand-intro',
  compositions: [
    {
      id: 'BrandIntro',
      component: BrandIntro,
      durationInFrames: 150,
      fps: 30,
      width: 1920,
      height: 1080,
      defaultProps: {
        name: 'qingyu_ge',
        tagline: '感知 · 记忆 · 创造',
        sub: 'AI-native research tools',
      },
    },
  ],
};
