import {C, FZ} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Terminal} from '../../../components/Terminal';
import {Typed} from '../../../components/Typed';
import {Caption} from '../../../components/Caption';

const Row: React.FC<{c: string; n: string; fail: string; rate: string; delay: number; warn?: boolean}> = ({c, n, fail, rate, delay, warn}) => (
  <Reveal delay={delay} y={8} style={{display: 'flex', color: warn ? C.warn : C.text, fontSize: FZ.term}}>
    <span style={{width: 240}}>{c}</span>
    <span style={{width: 130, color: C.dim}}>{n}</span>
    <span style={{width: 130}}>{fail}</span>
    <span style={{width: 130}}>{rate}{warn ? '  ⚠' : ''}</span>
  </Reveal>
);

/* S3c cmd —— Bash 命令 */
export const SceneCmd: React.FC = () => (
  <Backdrop>
    <Terminal title="cc-insights — Bash 命令" width={1220} appear={0}>
      <Typed text="cc-insights cmd -p 30d" start={6} />
      <div style={{height: 16}} />
      <Reveal delay={42} style={{color: C.dim, fontSize: FZ.termDim}}>COMMAND · 最近 30 天 · 1,284 次 Bash 调用</Reveal>
      <div style={{height: 18}} />
      <Reveal delay={50} style={{display: 'flex', color: C.dim, fontSize: FZ.termDim, borderBottom: `1px solid ${C.border}`, paddingBottom: 8}}>
        <span style={{width: 240}}>命令族</span>
        <span style={{width: 130}}>次数</span>
        <span style={{width: 130}}>失败</span>
        <span style={{width: 130}}>失败率</span>
      </Reveal>
      <div style={{height: 12}} />
      <Row c="git" n="312" fail="8" rate="2.6%" delay={60} />
      <Row c="go test" n="156" fail="23" rate="14.7%" delay={72} warn />
      <Row c="pnpm" n="98" fail="4" rate="4.1%" delay={84} />
      <div style={{height: 18}} />
      <Reveal delay={102} style={{color: C.red}}>⚠ 高风险命令（链式逐段解析）</Reveal>
      <Reveal delay={112} style={{color: C.text, fontSize: FZ.term, paddingLeft: 24}}>rm -rf build/ && cp -r dist ...</Reveal>
      <Reveal delay={122} style={{color: C.text, fontSize: FZ.term, paddingLeft: 24}}>curl -fsSL ... | bash  <span style={{color: C.red}}>（远程执行）</span></Reveal>
    </Terminal>
    <Caption delay={48} text="cmd —— 命令族失败率 + 链式逐段 + 高风险命令告警" />
  </Backdrop>
);
