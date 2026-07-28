#!/usr/bin/env node
// EP16 · reflog 让暂时不可达的提交重新获得引用。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const graph = `
  <path d="M260 850 H1600" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
  <path d="M260 750 V850 M1600 850 V950" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  ${K.refPill({x: 110, y: 650, label: 'main', width: 300, height: 100, fill: TEAL, stroke: INK, text: PAPER, fontSize: 44})}
  ${K.refPill({x: 1410, y: 950, label: 'rescue', width: 360, height: 100, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 42})}
  ${K.commitNode({x: 260, y: 850, label: 'C1', radius: 68, fill: PAPER, stroke: INK, fontSize: 37})}
  ${K.commitNode({x: 930, y: 850, label: 'C2', radius: 68, fill: PAPER, stroke: INK, fontSize: 37})}
  ${K.commitNode({x: 1600, y: 850, label: 'C3', radius: 76, fill: MUSTARD, stroke: INK, fontSize: 41, halo: TOMATO})}`;

const body = `
  ${K.bg({
    c1: {cx: 1650, cy: 420, rx: 540, ry: 330, fill: TEAL},
    c2: {cx: 20, cy: 1020, rx: 250, ry: 170, fill: TOMATO},
  })}
  ${K.badge({ep: '16', tag: 'reflog'})}

  <text x="66" y="490" font-family="${FONT.mono}" font-size="248" font-weight="${K.WEIGHT.bold}" letter-spacing="-15" fill="${TOMATO}">reflog</text>
  <text x="1120" y="470" font-family="${FONT.sans}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">提交没丢</text>
  ${graph}
`;

K.render({outDir: 'renders/git-course/ep16-reflog-recovery/tmp/cover-candidate', body, previews: true});
