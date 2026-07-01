import {Backdrop} from '../../../components/Backdrop';
import {DashboardShot, StoryStage, shot} from '../StoryPrimitives';

export const SceneTok: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="drilldown"
      title={
        <>
          证据跟着
          <br />
          同一组过滤条件走。
        </>
      }
      body="诊断卡下面不是孤立图表，而是失败样例、命令、Token、Session、工具的同屏下钻。"
    >
      <DashboardShot src={shot('drilldown-failures-focused')} width={1120} cropY={0} />
    </StoryStage>
  </Backdrop>
);
