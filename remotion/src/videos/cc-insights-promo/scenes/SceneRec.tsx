import {Video, staticFile} from 'remotion';
import {C} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {StoryStage} from '../StoryPrimitives';

export const SceneRec: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="rec"
      title={
        <>
          先判断，
          <br />
          再下钻。
        </>
      }
      body="cc-insights 的核心不是多一个报表，而是把异常转成下一步动作。"
    >
      <div
        style={{
          width: 1120,
          aspectRatio: '16 / 9',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(250,249,245,0.12)',
          boxShadow: '0 28px 70px rgba(0,0,0,0.32)',
          background: C.bg0,
        }}
      >
        <Video
          src={staticFile('manim/cc-rec-chain.mp4')}
          muted
          playbackRate={0.82}
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </div>
    </StoryStage>
  </Backdrop>
);
