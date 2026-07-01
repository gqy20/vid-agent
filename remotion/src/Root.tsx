import {Composition} from 'remotion';
import {BrandIntro} from './videos/brand-intro/BrandIntro';
import {CCInsightsPromo} from './videos/cc-insights-promo/CCInsightsPromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrandIntro"
        component={BrandIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          name: 'qingyu_ge',
          tagline: '感知 · 记忆 · 创造',
          sub: 'AI-native research tools',
        }}
      />
      <Composition
        id="CCInsightsPromo"
        component={CCInsightsPromo}
        durationInFrames={2086}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
