import {Ck, FZ, SANS, SANS_BOLD} from '../theme';
import {Rise, VBackdrop, VStage} from '../primitives';

const ITEMS = [
  {glyph: '图', title: '高校地图', desc: '一图看清分布'},
  {glyph: '演', title: '未来预演', desc: '预演大学四年'},
  {glyph: '模', title: '生活模拟', desc: '推演真实日常'},
  {glyph: '据', title: '真实数据', desc: '双一流 · 满意度'},
];

const Card: React.FC<{item: {glyph: string; title: string; desc: string}; delay: number}> = ({
  item,
  delay,
}) => (
  <Rise delay={delay} style={{width: 380}}>
    <div
      style={{
        background: Ck.bg1,
        borderRadius: 24,
        padding: '34px 28px',
        border: `1px solid ${Ck.hairline}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 20,
          background: Ck.brand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SANS_BOLD,
          fontSize: 48,
          color: Ck.bg1,
        }}
      >
        {item.glyph}
      </div>
      <div style={{fontFamily: SANS_BOLD, fontSize: FZ.label, color: Ck.ink}}>
        {item.title}
      </div>
      <div style={{fontFamily: SANS, fontSize: FZ.micro, color: Ck.ink3}}>
        {item.desc}
      </div>
    </div>
  </Rise>
);

export const SceneFeatures: React.FC = () => (
  <VBackdrop>
    <VStage gap={40}>
      <Rise delay={0}>
        <div style={{fontFamily: SANS_BOLD, fontSize: FZ.title, color: Ck.ink}}>
          一个工具，四种探索
        </div>
      </Rise>
      <div style={{display: 'grid', gridTemplateColumns: '380px 380px', gap: 28}}>
        {ITEMS.map((it, i) => (
          <Card key={it.title} item={it} delay={8 + i * 6} />
        ))}
      </div>
    </VStage>
  </VBackdrop>
);
