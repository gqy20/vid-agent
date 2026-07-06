import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P} from '../palette';

const tones = {
  steady: {bg: '#E9F0E7', line: P.sageDark, label: '稳健'},
  balanced: {bg: '#F2E8CF', line: P.gold, label: '均衡'},
  bold: {bg: '#EFE4EA', line: P.risk, label: '争取'},
};

export const ChoiceCards: React.FC<{
  choices: Array<{key: string; label: string; detail?: string; tone: keyof typeof tones}>;
  selected?: string;
  frameOffset?: number;
  compact?: boolean;
}> = ({choices, selected, frameOffset = 0, compact = false}) => {
  const frame = useCurrentFrame() - frameOffset;
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(3, 1fr)', gap: compact ? 14 : 18}}>
      {choices.map((choice, index) => {
        const tone = tones[choice.tone];
        const enter = spring({frame: frame - index * 5, fps, config: {damping: 18, stiffness: 120}});
        const isSelected = selected === choice.key || selected === `${choice.key}-${index}`;
        return (
          <div
            key={`${choice.key}-${choice.label}`}
            style={{
              minHeight: compact ? 86 : 150,
              borderRadius: 18,
              border: `3px solid ${isSelected ? tone.line : P.line}`,
              background: isSelected ? tone.bg : P.white,
              padding: compact ? '14px 16px' : '20px',
              transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px) scale(${isSelected ? 1.035 : 1})`,
              opacity: enter,
              boxShadow: isSelected ? `0 16px 28px rgba(36,33,29,0.14), inset 0 0 0 4px ${tone.bg}` : '0 12px 22px rgba(36,33,29,0.08)',
              fontFamily: FONT.sans,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{width: 38, height: 38, borderRadius: 12, background: tone.line, color: P.white, display: 'grid', placeItems: 'center', fontFamily: FONT.mono, fontWeight: 800}}>
                {choice.key}
              </div>
              <div style={{fontSize: compact ? 24 : 30, fontWeight: 800, color: P.ink}}>{choice.label}</div>
            </div>
            {!compact && (
              <div style={{marginTop: 14, fontSize: 21, lineHeight: 1.45, color: P.muted}}>
                {choice.detail ?? `${tone.label}行动，不是正确答案，只是一种代价。`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
