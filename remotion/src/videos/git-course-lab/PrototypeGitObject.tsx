import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {ConceptCaption} from './components/ConceptCaption';
import {ManimStage} from './components/ManimStage';
import {TerminalRecording} from './components/TerminalRecording';
import {LAB_COLOR} from './palette';
import {LAB_TYPE} from './typography';

const FPS = 30;
export const PROTOTYPE_DURATION = FPS * 25;
const TERMINAL_SRC = 'git-course-lab/terminal/ep00-git-object.mp4';
const MANIM_SRC = 'git-course-lab/manim/videos/git_object_transform_scene/1080p30/GitObjectTransformScene.mp4';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const PrototypeGitObject: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 16, 58, 72], [0, 1, 1, 0], clamp);
  const terminalOpacity = interpolate(frame, [54, 78, 174, 210], [0, 1, 1, 0.28], clamp);
  const terminalScale = interpolate(frame, [0, 174, 230], [0.92, 0.92, 0.34], clamp);
  const terminalX = interpolate(frame, [174, 230], [0, -610], clamp);
  const terminalY = interpolate(frame, [174, 230], [20, 294], clamp);
  const manimOpacity = interpolate(frame, [176, 220], [0, 1], clamp);
  const conclusionOpacity = interpolate(frame, [560, 620], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: LAB_COLOR.canvas, color: LAB_COLOR.text, fontFamily: LAB_TYPE.body.fontFamily}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 44%, ${LAB_COLOR.canvasSoft} 0%, ${LAB_COLOR.canvas} 58%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 104,
          opacity: titleOpacity,
          ...LAB_TYPE.display,
        }}
      >
        A commit is an
        <span style={{color: LAB_COLOR.commit}}> object graph</span>
      </div>

      <div style={{position: 'absolute', left: '50%', top: 214, transform: 'translateX(-50%)'}}>
        <TerminalRecording src={TERMINAL_SRC} opacity={terminalOpacity} scale={terminalScale} x={terminalX} y={terminalY} />
      </div>

      <Sequence from={180}>
        <ManimStage src={MANIM_SRC} opacity={manimOpacity} />
      </Sequence>

      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 180,
          width: 680,
          opacity: conclusionOpacity,
          ...LAB_TYPE.title,
        }}
      >
        `git commit` writes a commit object that points to a tree, not a copied folder.
      </div>

      <ConceptCaption start={215} end={720}>
        真实命令触发一次提交；概念动画负责解释提交背后的对象关系。
      </ConceptCaption>
    </AbsoluteFill>
  );
};
