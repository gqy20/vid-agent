import {C, MONO} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {CommandLine, StoryStage} from '../StoryPrimitives';

const facts = [
  'JSON / Markdown / Table 输出，AI 可以继续消费',
  'diagnostics.yml 管理阈值和触发解释',
  '本地 Dashboard，单二进制启动，无数据库依赖',
];

export const SceneFeatures: React.FC = () => (
  <Backdrop>
    <StoryStage
      eyebrow="workflow"
      title={
        <>
          从报告，
          <br />
          到修复位置。
        </>
      }
      body="高级诊断不是多显示几张图，而是告诉你该改 CLAUDE.md、脚本、hooks，还是任务拆分方式。"
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
        <CommandLine>cc-insights rec -p 30d -j</CommandLine>
        <div style={{display: 'grid', gap: 14}}>
          {facts.map((fact, i) => (
            <div
              key={fact}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '24px 28px',
                borderRadius: 12,
                background: 'rgba(250,249,245,0.06)',
                border: '1px solid rgba(250,249,245,0.12)',
                color: C.text,
                fontSize: 30,
              }}
            >
              <span style={{fontFamily: MONO, color: C.terracotta}}>0{i + 1}</span>
              <span>{fact}</span>
            </div>
          ))}
        </div>
      </div>
    </StoryStage>
  </Backdrop>
);
