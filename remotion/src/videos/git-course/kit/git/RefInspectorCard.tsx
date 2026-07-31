import {COLOR, FONT, WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

const splitSuffix = (text: string, suffix?: string) => {
  if (!suffix || !text.endsWith(suffix)) return {prefix: text, suffix: ''};
  return {prefix: text.slice(0, -suffix.length), suffix};
};

export const RefInspectorCard: React.FC<{
  pathLabel: string;
  path: string;
  pathAccent?: string;
  valueLabel: string;
  valuePrefix?: string;
  value: string;
  tone: string;
  pathColumnWidth?: number;
  valueFontSize?: number;
  style?: React.CSSProperties;
  auditId?: string;
}> = ({
  pathLabel,
  path,
  pathAccent,
  valueLabel,
  valuePrefix,
  value,
  tone,
  pathColumnWidth = 360,
  valueFontSize = 34,
  style,
  auditId = 'ref-inspector-card',
}) => {
  const pathParts = splitSuffix(path, pathAccent);

  return (
    <div
      data-audit-id={auditId}
      style={{
        height: 132,
        display: 'grid',
        gridTemplateColumns: `${pathColumnWidth}px 1fr`,
        columnGap: 32,
        padding: '24px 30px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        borderRadius: 11,
        background: 'rgba(255,255,255,0.72)',
        border: `1px solid ${COLOR.stroke.soft}`,
        boxShadow: `0 10px 30px ${COLOR.effects.shadowSoft}`,
        ...style,
      }}
    >
      <div style={{minWidth: 0, borderRight: `1px solid ${COLOR.stroke.soft}`}}>
        <div style={{fontFamily: FONT.sans, ...TYPE.ui, letterSpacing: '0.08em', color: COLOR.text.tertiary, fontWeight: WEIGHT.bold}}>
          {pathLabel}
        </div>
        <div style={{marginTop: 14, overflow: 'hidden', fontFamily: FONT.mono, fontSize: 27, lineHeight: 1.12, color: COLOR.text.primary, fontStyle: 'italic', fontWeight: WEIGHT.bold, whiteSpace: 'nowrap'}}>
          {pathParts.prefix}
          {pathParts.suffix ? <span style={{color: tone}}>{pathParts.suffix}</span> : null}
        </div>
      </div>
      <div style={{minWidth: 0}}>
        <div style={{fontFamily: FONT.sans, ...TYPE.ui, letterSpacing: '0.08em', color: COLOR.text.tertiary, fontWeight: WEIGHT.bold}}>
          {valueLabel}
        </div>
        <div style={{marginTop: 10, overflow: 'hidden', fontFamily: FONT.mono, fontSize: valueFontSize, lineHeight: 1.08, color: COLOR.text.primary, whiteSpace: 'nowrap'}}>
          {valuePrefix ? <span style={{color: COLOR.text.secondary}}>{valuePrefix}</span> : null}
          <span style={{color: tone, fontWeight: WEIGHT.bold}}>{value}</span>
        </div>
      </div>
    </div>
  );
};
