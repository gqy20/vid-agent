import {interpolate, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, SANS_BOLD, CLAMP, EASE_OUT} from '../theme';
import {Rise, VBackdrop, VStage} from '../primitives';

const SCENARIOS = [
  {q: '大一报到日', a: '室友来自五湖四海'},
  {q: '期末复习周', a: '图书馆抢座是日常'},
  {q: '社团招新', a: '百团大战眼花缭乱'},
];

const Tag: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: FZ.micro,
      color: Ck.brandDeep,
      background: Ck.brandSoft,
      padding: '6px 18px',
      borderRadius: 999,
    }}
  >
    {children}
  </div>
);

export const SceneSimulator: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <VBackdrop>
      <VStage gap={28}>
        {/* 人设卡 */}
        <Rise delay={4} style={{width: 820}}>
          <div
            style={{
              background: Ck.bg1,
              borderRadius: 22,
              border: `1px solid ${Ck.hairline}`,
              padding: '26px 30px',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: Ck.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SANS_BOLD,
                fontSize: 40,
                color: Ck.bg1,
                flexShrink: 0,
              }}
            >
              明
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 14, flex: 1}}>
              <div style={{fontFamily: SANS_BOLD, fontSize: FZ.label, color: Ck.ink}}>
                人设卡 · 小明
              </div>
              <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                {['文科', '外向', '南方'].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          </div>
        </Rise>

        {/* 情境卡 */}
        <div style={{width: 820, display: 'flex', flexDirection: 'column', gap: 18}}>
          {SCENARIOS.map((s, i) => {
            const d = 14 + i * 12;
            const o = interpolate(frame - d, [0, 10], [0, 1], CLAMP);
            const x = interpolate(frame - d, [0, 12], [32, 0], {
              ...CLAMP,
              easing: EASE_OUT,
            });
            return (
              <div
                key={s.q}
                style={{
                  opacity: o,
                  transform: `translateX(${x}px)`,
                  background: Ck.bg1,
                  borderRadius: 20,
                  border: `1px solid ${Ck.hairline}`,
                  borderLeft: `5px solid ${Ck.amber}`,
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{fontFamily: SANS_BOLD, fontSize: FZ.body, color: Ck.ink}}>
                  {s.q}
                </div>
                <div style={{fontFamily: SANS, fontSize: FZ.body, color: Ck.ink2}}>
                  → {s.a}
                </div>
              </div>
            );
          })}
        </div>

        {/* 分享按钮 */}
        <Rise delay={60}>
          <div
            style={{
              fontFamily: SANS_BOLD,
              fontSize: FZ.label,
              color: Ck.bg1,
              background: Ck.brand,
              padding: '16px 44px',
              borderRadius: 999,
            }}
          >
            分享我的大学剧本
          </div>
        </Rise>
      </VStage>
    </VBackdrop>
  );
};
