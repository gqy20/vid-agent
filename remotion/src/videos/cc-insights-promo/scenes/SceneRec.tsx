import {C, MONO, SANS} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {CommandLine, StoryStage} from '../StoryPrimitives';

const rows = [
  ['判断', '存在明显慢调用样例', C.red],
  ['证据', 'Bash:echo 单次 27.1min · Session f42733d9', C.warn],
  ['动作', '把高频慢路径封装成稳定脚本，提供快速验证入口', C.green],
];

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
      <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
        <CommandLine>cc-insights rec -p 30d</CommandLine>
        <div
          style={{
            width: 1120,
            borderRadius: 16,
            background: 'rgba(250,249,245,0.06)',
            border: '1px solid rgba(250,249,245,0.13)',
            overflow: 'hidden',
            boxShadow: '0 28px 70px rgba(0,0,0,0.32)',
          }}
        >
          {rows.map(([label, value, color]) => (
            <div
              key={label}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: 22,
                alignItems: 'center',
                padding: '30px 34px',
                borderBottom: label === '动作' ? 'none' : '1px solid rgba(250,249,245,0.1)',
              }}
            >
              <div style={{fontFamily: MONO, fontSize: 24, color}}>{label}</div>
              <div style={{fontFamily: SANS, fontSize: 34, color: C.white, lineHeight: 1.35}}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StoryStage>
  </Backdrop>
);
