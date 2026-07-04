import {Ck, FZ, SANS, SERIF_BOLD} from '../theme';
import {LogoMark, Rise, VBackdrop, VStage} from '../primitives';

export const SceneCTA: React.FC = () => (
  <VBackdrop>
    <VStage gap={44}>
      <Rise delay={2} y={24}>
        <div
          style={{
            fontFamily: SERIF_BOLD,
            fontSize: FZ.hero,
            color: Ck.ink,
            lineHeight: 1.12,
          }}
        >
          去看见
          <br />
          你的未来
        </div>
      </Rise>
      <Rise delay={12}>
        <div
          style={{
            fontFamily: SERIF_BOLD,
            fontSize: FZ.subtitle,
            color: Ck.bg1,
            background: Ck.brand,
            padding: '22px 56px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            boxShadow: '0 6px 24px rgba(63,143,155,0.32)',
          }}
        >
          gk.gqy20.top
          <span style={{fontSize: FZ.label, lineHeight: 1}}>↗</span>
        </div>
      </Rise>
      <Rise delay={20}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <LogoMark size={56} />
          <div
            style={{
              fontFamily: SANS,
              fontSize: FZ.label,
              color: Ck.ink3,
              letterSpacing: 2,
            }}
          >
            中国高校信息地图
          </div>
        </div>
      </Rise>
    </VStage>
  </VBackdrop>
);
