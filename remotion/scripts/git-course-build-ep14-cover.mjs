#!/usr/bin/env node
// EP14 · ahead / behind 比较的是两个本地 ref 的可达提交。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const graph = `
  <path d="M1030 830 H1260 M1260 830 L1510 710 M1260 830 L1510 950" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1510 710 H1740" fill="none" stroke="${TOMATO}" stroke-width="15" stroke-linecap="round"/>
  <path d="M1510 950 H1740" fill="none" stroke="${TEAL}" stroke-width="15" stroke-linecap="round"/>
  ${K.commitNode({x: 1030, y: 830, label: 'C1', radius: 64, fill: PAPER, stroke: INK, fontSize: 34})}
  ${K.commitNode({x: 1510, y: 710, label: 'R2', radius: 72, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 38})}
  ${K.commitNode({x: 1510, y: 950, label: 'L2', radius: 72, fill: TEAL, stroke: INK, text: PAPER, fontSize: 38})}
  ${K.refPill({x: 1570, y: 610, label: 'origin/main', width: 300, height: 92, fill: MUSTARD, stroke: INK, fontSize: 31})}
  ${K.refPill({x: 1570, y: 944, label: 'main', width: 250, height: 92, fill: TEAL, stroke: INK, text: PAPER, fontSize: 39})}
  <g transform="translate(1670 760) rotate(-5)">
    ${K.softShadowRect({width: 210, height: 82, rx: 14})}
    <rect width="210" height="82" rx="14" fill="${TOMATO}" stroke="${INK}" stroke-width="6"/>
    <text x="105" y="53" text-anchor="middle" font-family="${FONT.sans}" font-size="31" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">拒绝更新</text>
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1640, cy: 420, rx: 540, ry: 330, fill: TEAL},
    c2: {cx: 20, cy: 1020, rx: 250, ry: 170, fill: TOMATO},
  })}
  ${K.badge({ep: '14', tag: 'ahead · behind'})}

  <text x="66" y="410" font-family="${FONT.mono}" font-size="202" font-weight="${K.WEIGHT.bold}" letter-spacing="-12" fill="${TEAL}">ahead</text>
  <text x="66" y="650" font-family="${FONT.mono}" font-size="202" font-weight="${K.WEIGHT.bold}" letter-spacing="-12" fill="${MUSTARD}">behind</text>
  <text x="1110" y="500" font-family="${FONT.sans}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">比较谁</text>
  ${graph}
`;

K.render({outDir: 'renders/git-course/ep14-ahead-behind-non-fast-forward/tmp/cover-candidate', body, previews: true});
