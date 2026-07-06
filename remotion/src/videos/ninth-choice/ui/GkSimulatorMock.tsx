import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P} from '../palette';
import {profile} from '../story';

export const BrowserFrame: React.FC<{children: React.ReactNode; title?: string}> = ({children, title = 'gk.gqy20.top/simulator'}) => (
  <div style={{borderRadius: 28, overflow: 'hidden', border: `2px solid ${P.line}`, background: P.white, boxShadow: '0 34px 70px rgba(36,33,29,0.18)'}}>
    <div style={{height: 58, background: '#E7E1D7', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12}}>
      <span style={{width: 14, height: 14, borderRadius: 99, background: '#D36C5F'}} />
      <span style={{width: 14, height: 14, borderRadius: 99, background: '#D4A84E'}} />
      <span style={{width: 14, height: 14, borderRadius: 99, background: '#6F9E70'}} />
      <div style={{marginLeft: 16, height: 32, flex: 1, borderRadius: 999, background: P.paper, color: P.muted, fontFamily: FONT.mono, fontSize: 18, display: 'flex', alignItems: 'center', paddingLeft: 18}}>
        {title}
      </div>
    </div>
    {children}
  </div>
);

export const SimulatorSetupUI: React.FC<{risk?: number}> = ({risk = 5}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = (i: number) => spring({frame: frame - i * 8, fps, config: {damping: 18, stiffness: 100}});
  return (
    <BrowserFrame>
      <div style={{padding: 38, height: 560, fontFamily: FONT.sans, background: `linear-gradient(135deg, ${P.white}, ${P.paper})`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{fontSize: 24, color: P.sageDark, fontWeight: 800}}>大学人生模拟器</div>
            <div style={{marginTop: 8, fontSize: 46, color: P.ink, fontWeight: 900}}>你的大学故事，从这一刻开始</div>
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 18, color: P.muted}}>8 rounds</div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 34}}>
          {[
            ['学校', profile.school],
            ['专业', profile.major],
            ['性格', profile.tags.join('  ')],
            ['兴趣', profile.interests.join('  ')],
          ].map(([label, value], index) => (
            <Field key={label} label={label} value={value} progress={reveal(index)} />
          ))}
        </div>
        <div style={{marginTop: 28, padding: 22, borderRadius: 20, background: P.white, border: `2px solid ${P.line}`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 22, color: P.ink, fontWeight: 800}}>
            <span>风险偏好</span>
            <span>{risk}/10</span>
          </div>
          <div style={{height: 12, borderRadius: 99, background: '#DDD5C7', marginTop: 22, overflow: 'hidden'}}>
            <div style={{width: `${risk * 10}%`, height: '100%', background: `linear-gradient(90deg, ${P.sage}, ${P.gold}, ${P.clay})`}} />
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
};

export const PersonaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - 12, fps, config: {damping: 20, stiffness: 90}});
  return (
    <BrowserFrame title="gk.gqy20.top/simulator/result">
      <div style={{height: 560, padding: 42, background: `linear-gradient(145deg, ${P.white}, #ECE5D8)`, fontFamily: FONT.sans}}>
        <div style={{fontSize: 22, color: P.gold, fontWeight: 900}}>武汉大学 · 大学轨迹 · 人设卡</div>
        <div style={{marginTop: 14, fontSize: 64, color: P.ink, fontWeight: 950, transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`, opacity: enter}}>慢热行动派</div>
        <div style={{marginTop: 22, width: 760, fontSize: 28, lineHeight: 1.55, color: P.muted}}>
          你不是最外向的人，也不是每次都选最冒险的人。但你在关键节点没有退回安全区，学会了求助、复盘和保留真实兴趣。
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 34}}>
          <Metric label="GPA 估计" value="中上水平" />
          <Metric label="社交圈" value="小而稳定" />
        </div>
        <div style={{display: 'flex', gap: 12, marginTop: 28}}>
          {['慢热', '行动', '复盘', '稳定连接', '接受不确定'].map((tag) => (
            <span key={tag} style={{borderRadius: 999, border: `2px solid ${P.sage}`, padding: '10px 16px', fontSize: 21, color: P.sageDark, background: '#EEF4EA'}}>{tag}</span>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
};

const Field: React.FC<{label: string; value: string; progress: number}> = ({label, value, progress}) => (
  <div style={{padding: 18, borderRadius: 18, border: `2px solid ${P.line}`, background: P.white, opacity: progress, transform: `translateY(${(1 - progress) * 16}px)`}}>
    <div style={{fontSize: 17, color: P.muted}}>{label}</div>
    <div style={{marginTop: 8, fontSize: 27, color: P.ink, fontWeight: 800}}>{value}</div>
  </div>
);

const Metric: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={{borderRadius: 20, background: P.paper, border: `2px solid ${P.line}`, padding: 24}}>
    <div style={{fontSize: 18, color: P.muted}}>{label}</div>
    <div style={{marginTop: 8, fontSize: 32, color: P.ink, fontWeight: 900}}>{value}</div>
  </div>
);
