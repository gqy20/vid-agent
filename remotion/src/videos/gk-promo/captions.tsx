import {Sequence} from 'remotion';
import {CaptionBar} from './primitives';
import type {SceneId} from './timeline';

/* 与 renders/voiceover.srt 一一对应。仅 hook + map 两个场景配字幕——
 *  其它 4 个场景（brand/future/simulator/cta）的画面文字已自足，按
 *  taste.md "若画面已有大标题和产品截图，默认不加底部字幕" 删字幕。
 *  hook 作为开场情绪锚点保留；map 帮旁白做字幕对齐。
 *  时长 = ceil((endMs-startMs)/1000*30)。from 一律取 0（caption 铺满场景前半） */
const CAPTIONS: Partial<
  Record<SceneId, {text: string; from: number; durFrames: number}>
> = {
  hook: {text: '分数出来了。然后呢？全是未知。', from: 0, durFrames: 114},
  map: {text: '一张地图，看清每所学校在哪。', from: 0, durFrames: 96},
};

export const SceneCaption: React.FC<{id: SceneId}> = ({id}) => {
  const cap = CAPTIONS[id];
  if (!cap) return null;
  return (
    <Sequence from={cap.from} durationInFrames={cap.durFrames}>
      <CaptionBar text={cap.text} />
    </Sequence>
  );
};