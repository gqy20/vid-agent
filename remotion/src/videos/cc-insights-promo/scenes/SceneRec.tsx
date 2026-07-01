import {C} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {Reveal} from '../../../components/Reveal';
import {Terminal} from '../../../components/Terminal';
import {Typed} from '../../../components/Typed';
import {Caption} from '../../../components/Caption';

/* S3a rec —— 诊断 */
export const SceneRec: React.FC = () => (
  <Backdrop>
    <Terminal title="cc-insights — 诊断" width={1220} appear={0}>
      <Typed text="cc-insights rec -p 7d" start={6} />
      <div style={{height: 16}} />
      <Reveal delay={42} style={{color: C.dim, fontSize: 20}}>DIAGNOSIS · 最近 7 天 · 3 个诊断结论</Reveal>
      <div style={{height: 18}} />
      <Reveal delay={58}>
        <div style={{color: C.red}}>[1] ⚠ 高频超时拖慢会话 <span style={{color: C.dim, fontSize: 17}}>severity: high</span></div>
        <div style={{color: C.text, fontSize: 21, paddingLeft: 28}}><span style={{color: C.cyan}}>证据</span>  timeout 失败 28 次，集中在 WebFetch / Bash</div>
        <div style={{color: C.text, fontSize: 21, paddingLeft: 28}}><span style={{color: C.purple}}>根因</span>  长会话上下文膨胀 + 外部请求无重试</div>
        <div style={{color: C.text, fontSize: 21, paddingLeft: 28}}><span style={{color: C.green}}>下钻</span>  cc-insights why --reason timeout -n 5</div>
      </Reveal>
      <div style={{height: 16}} />
      <Reveal delay={98}>
        <div style={{color: C.warn}}>[2] ⚠ Token 成本集中在单一项目 <span style={{color: C.dim, fontSize: 17}}>severity: medium</span></div>
        <div style={{color: C.text, fontSize: 21, paddingLeft: 28}}><span style={{color: C.cyan}}>证据</span>  article-mcp 占 30d Token 的 61%</div>
        <div style={{color: C.text, fontSize: 21, paddingLeft: 28}}><span style={{color: C.green}}>下钻</span>  cc-insights tok -p 30d --project article-mcp</div>
      </Reveal>
    </Terminal>
    <Caption delay={48} text="rec —— 先给判断和根因，再给证据与可执行下钻命令" />
  </Backdrop>
);
