import {C} from '../../../theme';
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
      <div style={{position: 'relative'}}>
        <DashboardShot src={shot('drilldown-tokens')} width={1120} cropY={100} />
        <div
          style={{
            position: 'absolute',
            right: 34,
            top: 96,
            padding: '14px 18px',
            borderRadius: 9,
            background: 'rgba(143,189,182,0.94)',
            color: '#0d0e0d',
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          按模型 / Session / 项目定位
        </div>
        <div
          style={{
            position: 'absolute',
            left: 400,
            bottom: 74,
            width: 320,
            height: 92,
            border: '2px solid rgba(143,189,182,0.72)',
            borderRadius: 10,
            boxShadow: '0 0 30px rgba(143,189,182,0.22)',
          }}
        />
      </div>
    </StoryStage>
  </Backdrop>
);
