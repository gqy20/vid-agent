import {OffthreadVideo, staticFile} from 'remotion';
import {LAB_COLOR} from '../palette';
import {LAB_TYPE} from '../typography';

export const ManimStage: React.FC<{
  src?: string;
  opacity?: number;
}> = ({src, opacity = 1}) => {
  if (src) {
    return (
      <OffthreadVideo
        src={staticFile(src)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
        }}
      />
    );
  }

  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{display: 'block'}}>
        <line x1="556" y1="540" x2="820" y2="540" stroke={LAB_COLOR.blob} strokeWidth="5" strokeLinecap="round" />
        <line x1="1030" y1="540" x2="1294" y2="540" stroke={LAB_COLOR.tree} strokeWidth="5" strokeLinecap="round" />
        {[
          {x: 360, y: 472, w: 210, h: 136, title: 'README.md', detail: 'hello git', color: LAB_COLOR.text},
          {x: 820, y: 472, w: 210, h: 136, title: 'blob', detail: 'content', color: LAB_COLOR.blob},
          {x: 1294, y: 472, w: 210, h: 136, title: 'tree', detail: 'name -> blob', color: LAB_COLOR.tree},
          {x: 1514, y: 472, w: 246, h: 136, title: 'commit', detail: 'tree + message', color: LAB_COLOR.commit},
        ].map((item) => (
          <g key={item.title}>
            <rect x={item.x} y={item.y} width={item.w} height={item.h} rx="18" fill={LAB_COLOR.canvas} stroke={item.color} strokeWidth="5" />
            <text x={item.x + item.w / 2} y={item.y + 61} textAnchor="middle" fill={item.color} {...LAB_TYPE.label}>
              {item.title}
            </text>
            <text x={item.x + item.w / 2} y={item.y + 96} textAnchor="middle" fill={LAB_COLOR.muted} {...LAB_TYPE.label} fontSize="18">
              {item.detail}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

