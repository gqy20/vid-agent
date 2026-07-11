import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnimatedTerminal} from './components/AnimatedTerminal';
import {
  CodeBlock,
  CodeDiff,
  FileTree,
  GitGraph,
  GitRefWritePanel,
  GitStatePanel,
  ManimClip,
  RefWriteBar,
  type GitGraphState,
} from './kit';
import type {TerminalStep} from './data/terminalScripts';
import {COLOR, FONT, WEIGHT} from './palette';
import {TYPE} from './typography';

const demoTerminal: readonly TerminalStep[] = [
  {
    at: 0,
    promptBranch: 'main',
    command: 'git branch feature',
    output: ['# feature now points to C2'],
    effect: 'create-feature-pointer',
    typeFrames: 26,
  },
  {
    at: 58,
    promptBranch: 'main',
    command: 'git switch feature',
    output: ["Switched to branch 'feature'"],
    effect: 'move-head-to-feature',
    typeFrames: 28,
  },
];

const graphState: GitGraphState = {
  commits: [{id: 'C0'}, {id: 'C1'}, {id: 'C2'}, {id: 'C3'}],
  branches: [
    {name: 'main', target: 'C2', lane: 'bottom'},
    {name: 'feature', target: 'C3', lane: 'top', active: true},
  ],
  head: {target: 'C3', branch: 'feature'},
};

const GallerySection: React.FC<{
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({title, x, y, width, height, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      borderTop: `1px solid ${COLOR.stroke.soft}`,
      paddingTop: 14,
      boxSizing: 'border-box',
    }}
  >
    <div style={{...TYPE.uiSmall, color: COLOR.text.tertiary, fontWeight: WEIGHT.bold, marginBottom: 12, fontFamily: FONT.mono}}>
      {title}
    </div>
    {children}
  </div>
);

export const ComponentGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const branchMotion = interpolate(frame, [36, 92], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headMotion = interpolate(frame, [82, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const refProgress = interpolate(frame, [24, 88], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: COLOR.canvas.base, color: COLOR.text.primary, fontFamily: FONT.sans}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(110deg, ${COLOR.effects.mainWash}, transparent 48%, ${COLOR.effects.featureWash})`,
        }}
      />
      <header style={{position: 'absolute', left: 72, top: 42, right: 72, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div style={{...TYPE.title, fontSize: 34}}>Git course component gallery</div>
        <div style={{...TYPE.uiSmall, color: COLOR.text.secondary}}>Remotion + Manim primitives</div>
      </header>

      <GallerySection title="terminal / command causality" x={72} y={128} width={720} height={370}>
        <div style={{height: 314}}>
          <AnimatedTerminal steps={demoTerminal} maxVisibleSteps={2} inactiveOpacity={0.38} />
        </div>
      </GallerySection>

      <GallerySection title="git graph / refs / head motion" x={846} y={128} width={820} height={370}>
        <GitGraph
          state={graphState}
          width={760}
          height={255}
          showFrame
          branchMotion={{name: 'feature', from: 'C2', to: 'C3', progress: branchMotion}}
          headMotion={{from: 'main', to: 'feature', progress: headMotion}}
          note="branch moves by rewriting a ref"
          auditId="gallery-git-graph"
        />
        <RefWriteBar refName="refs/heads/feature" target="C3" progress={refProgress} x={0} y={282} width={548} height={54} />
      </GallerySection>

      <GallerySection title="state panels / code surfaces" x={72} y={542} width={820} height={420}>
        <div style={{display: 'grid', gridTemplateColumns: '520px 280px', gap: 18}}>
          <GitStatePanel
            areas={[
              {id: 'working-tree', title: 'Worktree', files: ['app.tsx', 'styles.css'], active: true},
              {id: 'index', title: 'Index', files: ['app.tsx']},
              {id: 'repository', title: 'Repo', files: ['C0', 'C1', 'C2']},
            ]}
          />
          <div style={{display: 'grid', gap: 14}}>
            <CodeBlock title=".git/HEAD" lines={['feature -> C3']} highlight={[0]} />
            <CodeDiff
              title="working diff"
              lines={[
                {type: 'context', text: 'Header() {'},
                {type: 'remove', text: '  oldTitle'},
                {type: 'add', text: '  newTitle'},
                {type: 'context', text: '}'},
              ]}
            />
          </div>
        </div>
      </GallerySection>

      <GallerySection title="ref write panel / manim clip wrapper" x={930} y={542} width={840} height={420}>
        <div style={{display: 'grid', gridTemplateColumns: '520px 300px', gap: 20, alignItems: 'start'}}>
          <div style={{position: 'relative', width: 520, height: 306, overflow: 'visible'}}>
            <div style={{transform: 'scale(0.65)', transformOrigin: 'top left', width: 800, height: 470}}>
              <GitRefWritePanel
                title="只写入一个名字"
                description="feature 指向当前 commit，文件目录不复制。"
                refName="refs/heads/feature"
                target="C2"
                branchName="feature"
                commits={[{id: 'C0'}, {id: 'C1'}, {id: 'C2'}]}
              />
            </div>
          </div>
          <div style={{display: 'grid', gap: 14}}>
            <ManimClip
              src="git-course/manim/ep04/branch-pointer.mp4"
              title="manim asset"
              height={260}
              fit="contain"
            />
            <FileTree
              title=".git"
              nodes={[
                {name: 'objects', kind: 'folder', status: 'tracked'},
                {name: 'refs', kind: 'folder', status: 'modified', children: [{name: 'feature', kind: 'file', status: 'added'}]},
              ]}
              highlight={['feature']}
            />
          </div>
        </div>
      </GallerySection>
    </AbsoluteFill>
  );
};
