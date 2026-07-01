import {C, FZ} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Terminal} from '../../../components/Terminal';
import {Typed} from '../../../components/Typed';
import {Caption} from '../../../components/Caption';
import {Bar} from '../../../components/Bar';

/* S3b tok —— 条形图 */
export const SceneTok: React.FC = () => (
  <Backdrop>
    <Terminal title="cc-insights — Token" width={1220} appear={0}>
      <Typed text="cc-insights tok -p 30d" start={6} />
      <div style={{height: 16}} />
      <Reveal delay={42} style={{color: C.dim, fontSize: FZ.termDim}}>TOKEN · 最近 30 天 · 共 12.4M tokens</Reveal>
      <div style={{height: 20}} />
      <Bar label="article-mcp" io="4.1M / 0.9M" pct={61} delay={56} color={C.cyan} />
      <Bar label="cc-insights" io="1.2M / 0.4M" pct={18} delay={70} color={C.purple} />
      <Bar label="zotero_cli" io="0.6M / 0.2M" pct={9} delay={84} color={C.green} />
      <Bar label="TrumanWorld" io="0.4M / 0.1M" pct={6} delay={98} color={C.warn} />
      <Bar label="其他" io="0.3M / 0.1M" pct={6} delay={112} color={C.dim} />
    </Terminal>
    <Caption delay={48} text="tok —— 按项目 / 模型 / 会话拆解，钱花在哪一目了然" />
  </Backdrop>
);
