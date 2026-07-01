import {C} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {DashboardShot, StoryStage, shot} from '../StoryPrimitives';

export const SceneCmd: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="command evidence"
      title={
        <>
          把失败归因到
          <br />
          具体命令。
        </>
      }
      body={
        <>
          echo、grep、cd 不再是日志噪声。调用次数、失败次数和失败率会变成可治理的路径。
        </>
      }
    >
      <div style={{position: 'relative'}}>
        <DashboardShot src={shot('drilldown-commands')} width={1120} cropY={100} />
        <div
          style={{
            position: 'absolute',
            right: 30,
            bottom: 28,
            padding: '16px 20px',
            borderRadius: 10,
            background: 'rgba(224,133,96,0.94)',
            color: C.white,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          test 失败率 39.4%
        </div>
      </div>
    </StoryStage>
  </Backdrop>
);
