#!/usr/bin/env node
// EP16 · reflog 让暂时不可达的提交重新获得引用。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const graph = `
  <path d="M340 805 H1580" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
  <path d="M340 650 V805 M1580 805 V960" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
  ${K.refPill({x: 160, y: 550, label: 'main', width: 360, height: 100, fill: TEAL, stroke: INK, text: PAPER, fontSize: 48})}
  ${K.refPill({x: 1370, y: 960, label: 'rescue', width: 420, height: 100, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 48})}
  ${K.commitNode({x: 340, y: 805, label: 'C1', radius: 88, fill: PAPER, stroke: INK, strokeWidth: 9, fontSize: 46})}
  ${K.commitNode({x: 960, y: 805, label: 'C2', radius: 88, fill: PAPER, stroke: INK, strokeWidth: 9, fontSize: 46})}
  ${K.commitNode({x: 1580, y: 805, label: 'C3', radius: 98, fill: MUSTARD, stroke: INK, strokeWidth: 9, fontSize: 50, halo: TOMATO})}`;

const body = `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep: '16', tag: 'reflog'})}

  <text x="66" y="470" font-family="${FONT.mono}" font-size="248" font-weight="${K.WEIGHT.bold}" letter-spacing="-15" fill="${TOMATO}">reflog</text>
  <text x="1120" y="470" font-family="${FONT.sans}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">提交没丢</text>
  ${graph}
`;

K.render({outDir: 'renders/git-course/ep16-reflog-recovery/tmp/cover-candidate', body, previews: true});
