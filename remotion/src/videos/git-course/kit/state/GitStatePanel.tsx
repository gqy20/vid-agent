import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export type GitArea = {
  id: 'working-tree' | 'index' | 'repository';
  title: string;
  files: readonly string[];
  active?: boolean;
};

const AREA_ACCENT: Record<GitArea['id'], string> = {
  'working-tree': COLOR.git.workingTree,
  index: COLOR.git.head,
  repository: COLOR.git.main,
};

export const GitStatePanel: React.FC<{
  areas: readonly GitArea[];
}> = ({areas}) => {
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${areas.length}, 1fr)`, gap: 14, width: '100%'}}>
      {areas.map((area) => (
        <div
          key={area.id}
          style={{
            minHeight: 260,
            borderRadius: 8,
            border: `1px solid ${area.active ? AREA_ACCENT[area.id] : COLOR.stroke.soft}`,
            background: area.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.52)',
            boxShadow: area.active ? `0 18px 54px ${COLOR.effects.shadowSoft}` : undefined,
            padding: '20px 20px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: 4,
              background: AREA_ACCENT[area.id],
              opacity: area.active ? 1 : 0.42,
            }}
          />
          <div style={{display: 'grid', gap: 7, marginBottom: 18}}>
            <div
              style={{
                ...TYPE.ui,
                color: COLOR.text.primary,
                fontWeight: 760,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {area.title}
            </div>
            <div
              style={{
                ...TYPE.label,
                fontFamily: FONT.mono,
                color: area.active ? AREA_ACCENT[area.id] : COLOR.text.tertiary,
                fontWeight: 780,
              }}
            >
              {area.active ? 'active' : area.files.length}
            </div>
          </div>
          <div style={{display: 'grid', gap: 10}}>
            {area.files.map((file) => (
              <div
                key={file}
                style={{
                  ...TYPE.codeSmall,
                  fontFamily: FONT.mono,
                  fontSize: 19,
                  color: COLOR.text.secondary,
                  borderRadius: 8,
                  border: `1px solid ${COLOR.stroke.soft}`,
                  background: area.active ? COLOR.canvas.overlay : COLOR.canvas.soft,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: AREA_ACCENT[area.id],
                    opacity: area.active ? 1 : 0.48,
                    flex: '0 0 auto',
                  }}
                />
                <span>{file}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
