import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, EASE_OUT, CLAMP} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';

/* S1 痛点钩子 */
export const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const noise = new Array(22).fill(0).map((_, i) => {
    const keys = ['"type":"tool_result"', '"isError":true', '"timeout"', '"tokens":4182', '"model":"claude"', '"WebFetch"', '"Bash"', '"exit_code":1'];
    return `{${keys[Math.floor(random(`k${i}`) * keys.length)]},"ts":17${Math.floor(random(`t${i}`) * 9e8)}...}`;
  });
  const scroll = f * 6;
  const dim = interpolate(f, [36, 70], [1, 0.12], {easing: EASE_OUT, ...CLAMP});
  return (
    <Backdrop>
      <AbsoluteFill style={{overflow: 'hidden', opacity: dim}}>
        <div style={{translate: `0px ${-scroll}px`, padding: 48}}>
          {noise.concat(noise).map((l, i) => (
            <div
              key={i}
              style={{
                fontFamily: MONO,
                fontSize: 19,
                color: i % 5 === 0 ? C.red : C.dim,
                opacity: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              ~/.claude/projects/{l}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <Reveal delay={64} dur={18} style={{position: 'absolute', textAlign: 'center', padding: '0 80px'}}>
        <div style={{fontFamily: MONO, fontSize: 30, color: C.dim, marginBottom: 36}}>
          <span style={{color: C.green}}>$ </span>grep -r "isError" ~/.claude/*.jsonl | wc -l
        </div>
        <div style={{fontFamily: SANS, fontSize: 82, fontWeight: 800, color: C.white, lineHeight: 1.32}}>
          为什么 Claude Code
          <br />
          <span style={{color: C.warn}}>越来越慢</span> ·{' '}
          <span style={{color: C.red}}>越来越贵</span> ·{' '}
          <span style={{color: C.purple}}>老是失败</span>?
        </div>
        <Reveal delay={104} dur={16}>
          <div style={{fontFamily: SANS, fontSize: 34, color: C.dim, marginTop: 34}}>
            翻 JSONL、数 token、grep 日志 —— 你需要的是诊断，不是体力活
          </div>
        </Reveal>
      </Reveal>
    </Backdrop>
  );
};
