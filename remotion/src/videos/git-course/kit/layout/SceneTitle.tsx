import {WEIGHT} from '../../palette';
import {TYPE} from '../../typography';

export const SCENE_TITLE_FONT_SIZE = 60;
export const SCENE_TITLE_MAX_DISPLAY_UNITS = 20;

const sceneTitleCharacterUnits = (character: string) => {
  if (/\s/u.test(character)) return 0.35;
  if (/[\x00-\x7F]/u.test(character)) return 0.55;
  if (/[，。：；、！？（）《》]/u.test(character)) return 0.55;
  return 1;
};

export const sceneTitleDisplayUnits = (title: string) =>
  [...title].reduce((total, character) => total + sceneTitleCharacterUnits(character), 0);

export const SceneTitle: React.FC<{
  readonly children: string;
  readonly marginBottom?: number;
  readonly auditId?: string;
  readonly style?: React.CSSProperties;
}> = ({children, marginBottom = 44, auditId = 'scene-title', style}) => {
  const displayUnits = sceneTitleDisplayUnits(children);
  if (displayUnits > SCENE_TITLE_MAX_DISPLAY_UNITS) {
    throw new Error(
      `SceneTitle exceeds ${SCENE_TITLE_MAX_DISPLAY_UNITS} display units: "${children}" (${displayUnits.toFixed(2)})`,
    );
  }

  return (
    <div
      data-audit-id={auditId}
      data-audit-single-line=""
      style={{
        ...style,
        ...TYPE.hero,
        fontSize: SCENE_TITLE_FONT_SIZE,
        fontWeight: WEIGHT.bold,
        marginBottom,
        maxWidth: '100%',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};
