import {AbsoluteFill} from 'remotion';
import {COLOR, FONT} from '../palette';
import {TYPE} from '../typography';

export const EpisodeShell: React.FC<{
  chapter: string;
  title: string;
  children: React.ReactNode;
}> = ({chapter, title, children}) => {
  return (
    <AbsoluteFill style={{background: COLOR.canvas.base, fontFamily: FONT.sans, color: COLOR.text.primary}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `linear-gradient(90deg, ${COLOR.effects.mainWash} 0%, transparent 36%, ${COLOR.effects.featureWash} 100%)`,
        }}
      />
      <header
        style={{
          position: 'absolute',
          left: 72,
          top: 46,
          right: 72,
          height: 72,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${COLOR.stroke.default}`,
        }}
      >
        <div style={{...TYPE.ui, color: COLOR.text.secondary, fontWeight: 700}}>{chapter}</div>
        <div style={{...TYPE.body, color: COLOR.text.primary, fontWeight: 780}}>{title}</div>
      </header>
      {children}
    </AbsoluteFill>
  );
};
