import {Backdrop} from '../../../components/Backdrop';
import {DashboardShot, StoryStage, shot} from '../StoryPrimitives';

export const SceneWeb: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="cost"
      title={
        <>
          成本最后要落到
          <br />
          模型和会话。
        </>
      }
      body="7.8B Token 不是一个炫目的大数。真正有用的是知道哪个模型、哪个 session、哪个项目在反复消耗。"
    >
      <DashboardShot src={shot('drilldown-tokens')} width={1120} cropY={100} />
    </StoryStage>
  </Backdrop>
);
