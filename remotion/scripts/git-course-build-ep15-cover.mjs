#!/usr/bin/env node
// EP15 · 冲突不仅在 Working Tree，也以 stage 1 / 2 / 3 留在 Index。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const stage = ({x, label, accent}) => `
  <g transform="translate(${x} 740)">
    ${K.softShadowRect({width: 210, height: 150, rx: 20, dx: 10, dy: 12, opacity: 0.16})}
    <rect width="210" height="150" rx="20" fill="${PAPER}" stroke="${accent}" stroke-width="8"/>
    <text x="105" y="62" text-anchor="middle" font-family="${FONT.mono}" font-size="31" font-weight="${K.WEIGHT.bold}" fill="${accent}">stage</text>
    <text x="105" y="119" text-anchor="middle" font-family="${FONT.mono}" font-size="58" font-weight="${K.WEIGHT.bold}" fill="${INK}">${label}</text>
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1650, cy: 420, rx: 540, ry: 330, fill: TEAL},
    c2: {cx: 20, cy: 1020, rx: 260, ry: 170, fill: TOMATO},
  })}
  ${K.badge({ep: '15', tag: 'unmerged index'})}

  <text x="66" y="520" font-family="${FONT.sans}" font-size="294" font-weight="${K.WEIGHT.bold}" letter-spacing="-18" fill="${TOMATO}">冲突</text>
  <text x="870" y="470" font-family="${FONT.sans}" font-size="150" font-weight="${K.WEIGHT.bold}" letter-spacing="-8" fill="${INK}">藏在 Index</text>
  <text x="1160" y="620" font-family="${FONT.mono}" font-size="76" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">app.js</text>

  ${stage({x: 650, label: '1', accent: INK})}
  ${stage({x: 920, label: '2', accent: TEAL})}
  ${stage({x: 1190, label: '3', accent: TOMATO})}
  <path d="M1430 815 H1540" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
  <path d="M1508 785 L1548 815 L1508 845" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  ${stage({x: 1580, label: '0', accent: MUSTARD})}
`;

K.render({outDir: 'renders/git-course/ep15-unmerged-index/tmp/cover-candidate', body, previews: true});
