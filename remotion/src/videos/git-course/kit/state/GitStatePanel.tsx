import {COLOR} from '../../palette';
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
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${areas.length}, 1fr)`, gap: 18, width: '100%'}}>
      {areas.map((area) => (
        <div
          key={area.id}
          style={{
            minHeight: 260,
            borderRadius: 14,
            border: `1px solid ${area.active ? AREA_ACCENT[area.id] : COLOR.stroke.default}`,
            background: area.active ? COLOR.canvas.overlay : COLOR.canvas.raised,
            boxShadow: area.active ? `0 18px 42px ${COLOR.effects.shadowSoft}` : undefined,
            padding: '22px 24px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}>
            <span style={{width: 11, height: 32, borderRadius: 999, background: AREA_ACCENT[area.id], display: 'inline-block'}} />
            <div style={{...TYPE.ui, color: COLOR.text.primary, fontWeight: 760}}>{area.title}</div>
          </div>
          <div style={{display: 'grid', gap: 10}}>
            {area.files.map((file) => (
              <div
                key={file}
                style={{
                  ...TYPE.codeSmall,
                  color: COLOR.text.secondary,
                  borderRadius: 8,
                  background: COLOR.canvas.soft,
                  padding: '8px 10px',
                }}
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
