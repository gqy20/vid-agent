import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {BrowserPanel, GitHubCourseLayout, GitHubStateBridge} from './kit';
import {COLOR} from './palette';
import {seconds} from './timeline';
import {TYPE} from './typography';

const galleryRecording = {
  id: 'gh05-create-pr',
  title: 'browser evidence',
  url: 'github.com/course-lab/demo/pull/12',
};

export const GITHUB_COURSE_GALLERY_DURATION = seconds(12);

export const ComponentGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const statusIn = interpolate(frame, [50, 78], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <GitHubCourseLayout
      episodeTitle="Browser + platform state + Git model"
      currentFrame={frame}
      durationInFrames={GITHUB_COURSE_GALLERY_DURATION}
    >
      <AbsoluteFill style={{padding: '112px 72px 70px', boxSizing: 'border-box'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1080px 1fr', gap: 44, height: 640}}>
          <BrowserPanel
            recording={galleryRecording}
            highlights={[
              {id: 'base-head', x: 0.17, y: 0.2, width: 0.36, height: 0.11, label: 'base / head', tone: 'action'},
              {id: 'merge-state', x: 0.64, y: 0.68, width: 0.2, height: 0.1, label: 'merge readiness', tone: 'approved'},
            ]}
            auditId="github-gallery-browser"
          />
          <div style={{paddingTop: 18}}>
            <div style={TYPE.title}>浏览器负责动作，模型负责解释</div>
            <div style={{...TYPE.body, marginTop: 18, color: COLOR.text.secondary}}>
              正式录制由 github-course-lab 派生。Remotion 不重画 GitHub 页面，只做稳定裁切和语义标注。
            </div>
            <div
              style={{
                marginTop: 30,
                padding: '18px 20px',
                borderRadius: 9,
                border: `1px solid ${COLOR.stroke.soft}`,
                background: COLOR.canvas.raised,
                opacity: statusIn,
              }}
            >
              <div style={{...TYPE.body, color: COLOR.text.primary}}>Checks 通过后，平台允许合并</div>
              <div style={{...TYPE.ui, marginTop: 8, color: COLOR.text.secondary}}>但 Git 状态变化仍然需要单独解释</div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 72, right: 72, bottom: 70}}>
          <GitHubStateBridge
            browser={{title: '点击 Merge', detail: '真实页面产生一次平台操作', accent: 'action'}}
            platform={{title: 'PR → merged', detail: 'review、checks 与 rules 已满足', accent: 'merged'}}
            git={{title: 'main → C6', detail: '提交图按选定 merge 策略变化', accent: 'git'}}
          />
        </div>
      </AbsoluteFill>
    </GitHubCourseLayout>
  );
};
