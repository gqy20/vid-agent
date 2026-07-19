import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export type GitArea = {
  id: 'working-tree' | 'index' | 'repository';
  title: string;
  files: readonly string[];
  active?: boolean;
};

const AREA_ACCENT: Record<GitArea['id'], string> = {
  'working-tree': COLOR.git.workingTree,
  index: COLOR.git.index,
  repository: COLOR.git.main,
};

export const GitStatePanel: React.FC<{
  areas: readonly GitArea[];
  prominent?: boolean;
  compact?: boolean;
}> = ({areas, prominent = false, compact = false}) => {
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${areas.length}, 1fr)`, gap: 14, width: '100%'}}>
      {areas.map((area) => (
        <div
          key={area.id}
          style={{
            minHeight: prominent ? 304 : compact ? 154 : 260,
            borderRadius: 8,
            border: `1px solid ${area.active ? AREA_ACCENT[area.id] : COLOR.stroke.soft}`,
            background: area.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.52)',
            boxShadow: area.active ? `0 18px 54px ${COLOR.effects.shadowSoft}` : undefined,
            padding: prominent ? '24px 24px 22px' : compact ? '16px 18px 14px' : '20px 20px 18px',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 18,
              marginBottom: prominent ? 22 : compact ? 12 : 18,
            }}
          >
            <div
              style={{
                ...TYPE.ui,
                fontSize: prominent ? 30 : compact ? 24 : TYPE.ui.fontSize,
                lineHeight: prominent ? 1.3 : TYPE.ui.lineHeight,
                color: prominent ? AREA_ACCENT[area.id] : COLOR.text.primary,
                fontWeight: prominent ? 780 : 760,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {area.title}
            </div>
            <div
              style={{
                ...TYPE.label,
                fontFamily: FONT.mono,
                fontSize: prominent ? 20 : compact ? 16 : TYPE.label.fontSize,
                lineHeight: 1,
                color: area.active ? AREA_ACCENT[area.id] : COLOR.text.tertiary,
                fontWeight: WEIGHT.bold,
                flex: '0 0 auto',
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
                  fontSize: prominent ? 26 : 19,
                  color: COLOR.text.secondary,
                  padding: '7px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: AREA_ACCENT[area.id],
                    opacity: area.active ? 1 : 0.62,
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
