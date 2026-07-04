import {interpolate, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, SANS_BOLD, CLAMP, EASE_OUT} from '../theme';
import {Eyebrow, Rise, VBackdrop, VStage} from '../primitives';

const NODES = [
  {y: '大一', t: '通识学习 · 校园生活'},
  {y: '大二', t: '专业深入 · 社团科研'},
  {y: '大三', t: '实习竞赛 · 方向选择'},
  {y: '大四', t: '毕业设计 · 就业深造'},
];

const Row: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
    <div
      style={{
        width: 68,
        fontFamily: SANS,
        fontSize: FZ.micro,
        color: Ck.brandDeep,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
    <div style={{fontFamily: SANS_BOLD, fontSize: FZ.body, color: Ck.ink}}>
      {value}
    </div>
  </div>
);

export const SceneFuture: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <VBackdrop>
      <VStage gap={32}>
        <Rise delay={0}>
          <Eyebrow color={Ck.brand}>未来预演</Eyebrow>
        </Rise>

        {/* 输入卡：学校 + 专业 */}
        <Rise delay={4} style={{width: 820}}>
          <div
            style={{
              background: Ck.bg1,
              borderRadius: 22,
              border: `1px solid ${Ck.hairline}`,
              padding: '26px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <Row label="学校" value="你的目标大学" />
            <div style={{height: 1, background: Ck.hairline}} />
            <Row label="专业" value="你的方向" />
          </div>
        </Rise>

        {/* 四年纵向时间线 */}
        <div
          style={{
            width: 820,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 48,
              top: 20,
              bottom: 20,
              width: 2,
              background: Ck.line,
            }}
          />
          {NODES.map((n, i) => {
            const d = 14 + i * 12;
            const o = interpolate(frame - d, [0, 10], [0, 1], CLAMP);
            const x = interpolate(frame - d, [0, 12], [26, 0], {
              ...CLAMP,
              easing: EASE_OUT,
            });
            const active = frame >= d;
            return (
              <div
                key={n.y}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 26,
                  padding: '13px 0',
                  opacity: o,
                  transform: `translateX(${x}px)`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: active ? Ck.amber : Ck.brandSoft,
                    border: `5px solid ${Ck.bg0}`,
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                    marginLeft: 18,
                  }}
                />
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                  <div style={{fontFamily: SANS_BOLD, fontSize: FZ.label, color: Ck.ink}}>
                    {n.y}
                  </div>
                  <div style={{fontFamily: SANS, fontSize: FZ.body, color: Ck.ink2}}>
                    {n.t}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </VStage>
    </VBackdrop>
  );
};
