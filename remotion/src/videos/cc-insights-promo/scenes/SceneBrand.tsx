import {C, MONO} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {DashboardShot, StoryStage, shot} from '../StoryPrimitives';

export const SceneBrand: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="finding"
      title={
        <>
          第一条结论：
          <br />
          慢调用不是感觉。
        </>
      }
      body={
        <>
          不再看 Top N 排行。先锁定可修复对象，再看证据和下一条命令。
        </>
      }
    >
      <div style={{position: 'relative'}}>
        <DashboardShot src={shot('diagnostics')} width={1120} cropY={0} />
        <div
          style={{
            position: 'absolute',
            left: 38,
            top: 36,
            padding: '14px 18px',
            borderRadius: 10,
            background: 'rgba(205,92,92,0.92)',
            color: C.white,
            fontFamily: MONO,
            fontSize: 22,
            boxShadow: '0 16px 38px rgba(0,0,0,0.22)',
          }}
        >
          Bash:echo · 27.1min
        </div>
      </div>
    </StoryStage>
  </Backdrop>
);
