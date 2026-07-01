import {C} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {DashboardShot, MetricRow, StoryStage, shot} from '../StoryPrimitives';

export const SceneHook: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="30d evidence"
      title={
        <>
          先看异常，
          <br />
          不先讲功能。
        </>
      }
      body={
        <>
          30 天内的 Claude Code 使用已经出现稳定模式：高失败率、长会话和巨量
          Token 同时发生。
        </>
      }
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
        <MetricRow
          items={[
            {label: 'messages', value: '67,823'},
            {label: 'sessions', value: '271'},
            {label: 'failure rate', value: '27.31%', tone: 'bad'},
            {label: 'tokens', value: '7.8B', tone: 'warn'},
          ]}
        />
        <DashboardShot src={shot('overview')} width={1120} cropY={0} />
        <div style={{fontSize: 24, color: C.dim}}>
          画面给总量，结论只说一件事：问题已经有模式。
        </div>
      </div>
    </StoryStage>
  </Backdrop>
);
