import {COLOR} from '../../palette';
import {TYPE} from '../../typography';

export const EpisodeTitleCard: React.FC<{
  index: string;
  prefix?: string;
  keyword: string;
  suffix: string;
  opacity?: number;
  translateY?: number;
  keywordOpacity?: number;
  keywordTranslateY?: number;
  underlineScale?: number;
  underlineOpacity?: number;
  auditId?: string;
}> = ({
  index,
  prefix = '',
  keyword,
  suffix,
  opacity = 1,
  translateY = 0,
  keywordOpacity = 1,
  keywordTranslateY = 0,
  underlineScale = 1,
  underlineOpacity = 1,
  auditId,
}) => (
  <div
    data-audit-id={auditId}
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      opacity,
      transform: `translateY(${translateY}px)`,
    }}
  >
    <div style={{textAlign: 'center'}}>
      <div style={{...TYPE.display, fontSize: 112, lineHeight: 1.08, color: COLOR.text.primary, fontWeight: 880}}>
        <span style={{color: COLOR.text.tertiary}}>{index}</span>{' '}
        {prefix ? <><span>{prefix}</span>{' '}</> : null}
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            color: COLOR.git.main,
            opacity: keywordOpacity,
            transform: `translateY(${keywordTranslateY}px)`,
          }}
        >
          {keyword}
          <span
            style={{
              position: 'absolute',
              left: 4,
              right: 2,
              bottom: -8,
              height: 5,
              borderRadius: 999,
              background: COLOR.git.main,
              opacity: underlineOpacity,
              transform: `scaleX(${underlineScale})`,
              transformOrigin: 'left center',
            }}
          />
        </span>{' '}
        <span>{suffix}</span>
      </div>
    </div>
  </div>
);
