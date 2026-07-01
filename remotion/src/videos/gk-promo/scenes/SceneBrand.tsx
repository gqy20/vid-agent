import {Ck, FZ, SANS, SANS_BOLD} from '../theme';
import {CaptionBar, LogoMark, Rise, VBackdrop, VStage} from '../primitives';

const CAPTION = 'GK，让志愿看得见。';

export const SceneBrand: React.FC = () => (
  <VBackdrop>
    <VStage gap={30}>
      <Rise delay={2}>
        <LogoMark size={150} />
      </Rise>
      <Rise delay={8} y={20}>
        <div
          style={{
            fontFamily: SANS_BOLD,
            fontSize: FZ.hero,
            color: Ck.ink,
            letterSpacing: 3,
            lineHeight: 1,
          }}
        >
          GK
        </div>
      </Rise>
      <Rise delay={14}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: FZ.subtitle,
            color: Ck.ink2,
            letterSpacing: 3,
          }}
        >
          中国高校信息地图
        </div>
      </Rise>
      <Rise delay={20}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: FZ.body,
            color: Ck.brandDeep,
            marginTop: 10,
          }}
        >
          把志愿，变成看得见的未来
        </div>
      </Rise>
    </VStage>
    <CaptionBar text={CAPTION} delay={18} />
  </VBackdrop>
);
