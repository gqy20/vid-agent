import {Ck, FZ, SANS, SERIF_BOLD} from '../theme';
import {LogoMark, Rise, VBackdrop, VStage} from '../primitives';

export const SceneBrand: React.FC = () => (
  <VBackdrop>
    <VStage gap={30}>
      <Rise delay={2}>
        <LogoMark size={150} />
      </Rise>
      <Rise delay={8} y={20}>
        <div
          style={{
            fontFamily: SERIF_BOLD,
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
            fontFamily: SERIF_BOLD,
            fontSize: FZ.body,
            color: Ck.brandDeep,
            marginTop: 10,
          }}
        >
          把志愿，变成看得见的未来
        </div>
      </Rise>
    </VStage>
  </VBackdrop>
);
