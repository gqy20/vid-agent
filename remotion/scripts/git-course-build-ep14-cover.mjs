#!/usr/bin/env node
// EP14 · ahead / behind 比较的是两个本地 ref 的可达提交。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const graph = `
  <path d="M900 650 H1170 M1170 650 L1470 520 M1170 650 L1470 780" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1470 520 H1588" fill="none" stroke="${TOMATO}" stroke-width="16" stroke-linecap="round"/>
  <path d="M1470 780 H1588" fill="none" stroke="${TEAL}" stroke-width="16" stroke-linecap="round"/>
  ${K.commitNode({x: 900, y: 650, label: 'C1', radius: 78, fill: PAPER, stroke: INK, fontSize: 40})}
  ${K.commitNode({x: 1470, y: 520, label: 'R2', radius: 84, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 44})}
  ${K.commitNode({x: 1470, y: 780, label: 'L2', radius: 84, fill: TEAL, stroke: INK, text: PAPER, fontSize: 44})}
  ${K.refPill({x: 1585, y: 472, label: 'origin/main', width: 285, height: 96, fill: MUSTARD, stroke: INK, fontSize: 31})}
  ${K.refPill({x: 1585, y: 732, label: 'main', width: 260, height: 96, fill: TEAL, stroke: INK, text: PAPER, fontSize: 40})}`;

const body = `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep: '14', tag: 'ahead · behind'})}

  <text x="66" y="455" font-family="${FONT.mono}" font-size="190" font-weight="${K.WEIGHT.bold}" letter-spacing="-11" fill="${TEAL}">ahead</text>
  <text x="66" y="700" font-family="${FONT.mono}" font-size="190" font-weight="${K.WEIGHT.bold}" letter-spacing="-11" fill="${MUSTARD}">behind</text>
  <text x="1350" y="340" text-anchor="middle" font-family="${FONT.sans}" font-size="145" font-weight="${K.WEIGHT.bold}" letter-spacing="-7" fill="${INK}">和谁比</text>
  ${graph}
`;

K.render({outDir: 'renders/git-course/ep14-ahead-behind-non-fast-forward/tmp/cover-candidate', body, previews: true});
