import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, SANS_BOLD, CLAMP} from '../theme';
import {CaptionBar, Eyebrow, Rise, VBackdrop, VStage} from '../primitives';

/* 截图就绪前置 false 用代码散点占位；截图生成后改 true 走真实 3D 地图截图 */
const USE_SHOT = false;
const SHOT = 'gk-shots/map-cn.png';

const FRAME_W = 860;
const FRAME_H = 1010;
const PAD = 76;
const PLOT_W = FRAME_W - PAD * 2;
const PLOT_H = FRAME_H - PAD * 2;

type Pt = {x: number; y: number; big?: boolean; label?: string};
const POINTS: Pt[] = [
  {x: 0.62, y: 0.3, big: true, label: '北京'},
  {x: 0.64, y: 0.31},
  {x: 0.6, y: 0.34},
  {x: 0.55, y: 0.33},
  {x: 0.66, y: 0.37},
  {x: 0.55, y: 0.41},
  {x: 0.69, y: 0.43, big: true, label: '南京'},
  {x: 0.73, y: 0.49},
  {x: 0.65, y: 0.49},
  {x: 0.72, y: 0.46, big: true, label: '上海'},
  {x: 0.62, y: 0.59},
  {x: 0.71, y: 0.59},
  {x: 0.55, y: 0.63},
  {x: 0.55, y: 0.54, big: true, label: '武汉'},
  {x: 0.43, y: 0.59},
  {x: 0.38, y: 0.56, big: true, label: '成都'},
  {x: 0.45, y: 0.69},
  {x: 0.38, y: 0.73},
  {x: 0.5, y: 0.79},
  {x: 0.52, y: 0.88},
  {x: 0.45, y: 0.43, big: true, label: '西安'},
  {x: 0.36, y: 0.41},
  {x: 0.32, y: 0.45},
  {x: 0.43, y: 0.33},
  {x: 0.5, y: 0.22},
  {x: 0.12, y: 0.32},
  {x: 0.22, y: 0.58},
  {x: 0.79, y: 0.62},
  {x: 0.8, y: 0.1},
  {x: 0.76, y: 0.15},
  {x: 0.73, y: 0.21},
];

const CAPTION = '一张地图，看清每所学校在哪。';

export const SceneMap: React.FC = () => {
  const frame = useCurrentFrame();
  const px = (p: Pt) => PAD + p.x * PLOT_W;
  const py = (p: Pt) => PAD + p.y * PLOT_H;
  const enter = interpolate(frame, [0, 16], [0.965, 1], CLAMP);

  return (
    <VBackdrop>
      <VStage gap={28}>
        <Rise delay={0}>
          <Eyebrow color={Ck.brand}>高校地图</Eyebrow>
        </Rise>
        <div style={{width: FRAME_W, height: FRAME_H, transform: `scale(${enter})`}}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              background: Ck.bg1,
              borderRadius: 28,
              border: `2px solid ${Ck.line}`,
              overflow: 'hidden',
            }}
          >
            <svg
              width={FRAME_W}
              height={FRAME_H}
              style={{position: 'absolute', inset: 0}}
            >
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={`v${g}`}
                  x1={g * FRAME_W}
                  y1={0}
                  x2={g * FRAME_W}
                  y2={FRAME_H}
                  stroke={Ck.hairline}
                  strokeWidth={1}
                />
              ))}
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={`h${g}`}
                  x1={0}
                  y1={g * FRAME_H}
                  x2={FRAME_W}
                  y2={g * FRAME_H}
                  stroke={Ck.hairline}
                  strokeWidth={1}
                />
              ))}
              {POINTS.map((p, i) => {
                const d = i * 1.4;
                const o = interpolate(frame - d, [0, 8], [0, 1], CLAMP);
                const s = interpolate(frame - d, [0, 10], [0, 1], CLAMP);
                return (
                  <g
                    key={i}
                    opacity={o}
                    transform={`translate(${px(p)} ${py(p)}) scale(${s})`}
                  >
                    {p.big && <circle r={22} fill={Ck.amber} opacity={0.18} />}
                    <circle r={p.big ? 13 : 7} fill={p.big ? Ck.amber : Ck.brand} />
                    {p.big && p.label && (
                      <text
                        x={18}
                        y={6}
                        fontFamily={SANS}
                        fontSize={28}
                        fontWeight={700}
                        fill={Ck.ink}
                      >
                        {p.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            {USE_SHOT && (
              <Img
                src={staticFile(SHOT)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
          </div>
        </div>
        <Rise delay={22}>
          <div style={{fontFamily: SANS, fontSize: FZ.micro, color: Ck.ink3}}>
            中国双一流高校 · 按省份分布
          </div>
        </Rise>
      </VStage>
      <CaptionBar text={CAPTION} delay={16} />
    </VBackdrop>
  );
};
