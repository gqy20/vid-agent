import {COLOR, FONT} from './palette';
import {TYPE} from './typography';

export const SUBTITLE = {
  narration: {
    left: 420,
    right: 420,
    bottom: 54,
    minHeight: 56,
    padding: '0 32px',
    text: TYPE.subtitle,
    fontWeight: 640,
    color: COLOR.text.primary,
    background: COLOR.canvas.overlay,
    border: COLOR.stroke.soft,
    shadow: COLOR.effects.shadowSoft,
    maxLines: 2,
  },
  action: {
    left: 690,
    right: 690,
    bottom: 54,
    minHeight: 44,
    padding: '0 22px',
    text: TYPE.ui,
    fontWeight: 740,
    color: COLOR.text.primary,
    background: COLOR.canvas.overlay,
    border: COLOR.stroke.soft,
    shadow: COLOR.effects.shadowSoft,
    maxLines: 1,
  },
  inline: {
    text: TYPE.uiSmall,
    fontWeight: 760,
    color: COLOR.text.primary,
    background: COLOR.canvas.overlay,
    border: COLOR.stroke.soft,
  },
  fontFamily: FONT.sans,
  radius: 10,
} as const;
