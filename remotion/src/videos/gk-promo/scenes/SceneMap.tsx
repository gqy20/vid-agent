import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Ck, FZ, SANS, CLAMP} from '../theme';
import {Eyebrow, Rise, VBackdrop, VStage} from '../primitives';
import {SceneCaption} from '../captions';

/* 截图就绪前置 false 用代码散点占位；截图生成后改 true 走真实 3D 地图截图 */
const USE_SHOT = false;
const SHOT = 'gk-shots/map-cn.png';

const FRAME_W = 860;
const FRAME_H = 1010;
const PAD = 76;
const PLOT_W = FRAME_W - PAD * 2;
const PLOT_H = FRAME_H - PAD * 2;

type Tier = 'mega' | 'major' | 'mid' | 'single';
type Pt = {x: number; y: number; tier: Tier; label?: string};

const TIER_RADIUS: Record<Tier, number> = {mega: 20, major: 14, mid: 9, single: 6};
const TIER_LABEL: Partial<Record<Tier, boolean>> = {mega: true, major: true};

/* ponytail: 经纬度→0-1 简单等距投影；不追求墨卡托精度，仅做版图分布直觉。
 * 范围：lat 18–54°N（海南南→漠河北），lon 73–135°E（喀什→抚远）。
 * y 轴反转（图像坐标向下）。
 *
 * 双一流 count 取自 2022 第二轮 双一流 建设名单（147 所）。
 * 按 count 分 4 档：mega(≥10) / major(5-9) / mid(2-4) / single(1)。
 * 删去无 双一流 的纯地理城市（港澳台/三亚/喀什/敦煌等），总数 61→34，
 * 视觉重心真实反映东中西部双一流密度差（"真实数据"替代"虚构 KPI"）。 */
type City = {name: string; lat: number; lon: number; count: number};
const CITY_DATA: City[] = [
  /* mega (≥10) — 3 城 */
  {name: '北京', lat: 39.9, lon: 116.4, count: 34},
  {name: '上海', lat: 31.2, lon: 121.5, count: 15},
  {name: '南京', lat: 32.1, lon: 118.8, count: 13},
  /* major (5-9) — 6 城 */
  {name: '杭州', lat: 30.3, lon: 120.2, count: 7},
  {name: '武汉', lat: 30.6, lon: 114.3, count: 7},
  {name: '西安', lat: 34.3, lon: 108.9, count: 7},
  {name: '广州', lat: 23.1, lon: 113.3, count: 7},
  {name: '成都', lat: 30.7, lon: 104.1, count: 5},
  {name: '天津', lat: 39.1, lon: 117.2, count: 5},
  /* mid (2-4) — 11 城 */
  {name: '哈尔滨', lat: 45.8, lon: 126.5, count: 4},
  {name: '长沙', lat: 28.2, lon: 112.9, count: 4},
  {name: '合肥', lat: 31.8, lon: 117.3, count: 3},
  {name: '长春', lat: 43.9, lon: 125.3, count: 3},
  {name: '济南', lat: 36.7, lon: 117.0, count: 3},
  {name: '沈阳', lat: 41.8, lon: 123.4, count: 3},
  {name: '重庆', lat: 29.6, lon: 106.5, count: 2},
  {name: '大连', lat: 38.9, lon: 121.6, count: 2},
  {name: '青岛', lat: 36.1, lon: 120.4, count: 2},
  {name: '兰州', lat: 36.1, lon: 103.8, count: 2},
  {name: '厦门', lat: 24.5, lon: 118.1, count: 1},
  /* single (1) — 14 城 */
  {name: '苏州', lat: 31.3, lon: 120.6, count: 1},
  {name: '郑州', lat: 34.7, lon: 113.6, count: 1},
  {name: '福州', lat: 26.1, lon: 119.3, count: 1},
  {name: '南昌', lat: 28.7, lon: 115.9, count: 1},
  {name: '南宁', lat: 22.8, lon: 108.4, count: 1},
  {name: '昆明', lat: 25.0, lon: 102.7, count: 1},
  {name: '贵阳', lat: 26.6, lon: 106.7, count: 1},
  {name: '海口', lat: 20.0, lon: 110.3, count: 1},
  {name: '拉萨', lat: 29.6, lon: 91.1, count: 1},
  {name: '西宁', lat: 36.6, lon: 101.8, count: 1},
  {name: '银川', lat: 38.5, lon: 106.2, count: 1},
  {name: '乌鲁木齐', lat: 43.8, lon: 87.6, count: 1},
  {name: '石家庄', lat: 38.0, lon: 114.5, count: 1},
  {name: '太原', lat: 37.9, lon: 112.5, count: 1},
  {name: '呼和浩特', lat: 40.8, lon: 111.7, count: 1},
];

const tierOf = (count: number): Tier =>
  count >= 10 ? 'mega' : count >= 5 ? 'major' : count >= 2 ? 'mid' : 'single';

const norm = (lat: number, lon: number): {x: number; y: number} => ({
  x: (lon - 73) / 62,
  y: 1 - (lat - 18) / 36,
});

const POINTS: Pt[] = CITY_DATA.map((c) => {
  const tier = tierOf(c.count);
  const p = norm(c.lat, c.lon);
  return TIER_LABEL[tier] ? {x: p.x, y: p.y, tier, label: c.name} : {x: p.x, y: p.y, tier};
});

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
                  x2={g * FRAME_W}
                  y2={g * FRAME_H}
                  stroke={Ck.hairline}
                  strokeWidth={1}
                />
              ))}
              {POINTS.map((p, i) => {
                const d = i * 1.4;
                const o = interpolate(frame - d, [0, 8], [0, 1], CLAMP);
                const s = interpolate(frame - d, [0, 10], [0, 1], CLAMP);
                const r = TIER_RADIUS[p.tier];
                const isAmber = p.tier === 'mega' || p.tier === 'major';
                return (
                  <g
                    key={i}
                    opacity={o}
                    transform={`translate(${px(p)} ${py(p)}) scale(${s})`}
                  >
                    {p.tier === 'mega' && <circle r={32} fill={Ck.amber} opacity={0.18} />}
                    <circle r={r} fill={isAmber ? Ck.amber : Ck.brand} />
                    {p.label && (
                      <text
                        x={r + 6}
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
            34 城 · 147 所 双一流 高校 · 圆点按城市入选数加权
          </div>
        </Rise>
      </VStage>
      <SceneCaption id="map" />
    </VBackdrop>
  );
};