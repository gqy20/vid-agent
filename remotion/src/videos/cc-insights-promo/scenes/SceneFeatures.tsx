import {C, MONO, SANS} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';

/* S4 卖点 */
export const SceneFeatures: React.FC = () => {
  const cards = [
    {t: '诊断优先', d: 'rec 先给判断与根因，\n再给证据和下钻命令', i: '◎', c: C.cyan},
    {t: 'AI 友好', d: 'JSON / Markdown / Table\n三种输出，AI 直接消费', i: '⌬', c: C.purple},
    {t: '单文件部署', d: '静态资源内嵌二进制\nUPX 后约 2.7MB', i: '◇', c: C.green},
    {t: '规则可配', d: 'Bash 分类与诊断阈值\nYAML 配置，无需改代码', i: '⚙', c: C.warn},
  ];
  return (
    <Backdrop>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 54}}>
        <Reveal delay={4} dur={16} style={{fontFamily: SANS, fontSize: 58, fontWeight: 800, color: C.white}}>
          为诊断而生，不只是统计
        </Reveal>
        <div style={{display: 'flex', gap: 30}}>
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={18 + i * 12} y={28}
              style={{width: 292, background: C.termBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '34px 28px', boxShadow: '0 24px 56px rgba(0,0,0,0.42)'}}>
              <div style={{fontSize: 52, color: c.c, marginBottom: 18}}>{c.i}</div>
              <div style={{fontFamily: SANS, fontSize: 32, fontWeight: 700, color: C.white, marginBottom: 14}}>{c.t}</div>
              <div style={{fontFamily: SANS, fontSize: 22, color: C.dim, lineHeight: 1.55, whiteSpace: 'pre-line'}}>{c.d}</div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={82} style={{fontFamily: MONO, fontSize: 24, color: C.dim}}>
          Go 1.21+ · MIT License · macOS / Linux / Windows
        </Reveal>
      </div>
    </Backdrop>
  );
};
