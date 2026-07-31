#!/usr/bin/env node
// EP15 · 冲突不仅在 Working Tree，也以 stage 1 / 2 / 3 留在 Index。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const stage = ({x, label, accent}) => `
  <g transform="translate(${x} 560)">
    ${K.softShadowRect({width: 230, height: 250, rx: 22, dx: 11, dy: 13, opacity: 0.16})}
    <rect width="230" height="250" rx="22" fill="${PAPER}" stroke="${accent}" stroke-width="9"/>
    <text x="115" y="82" text-anchor="middle" font-family="${FONT.mono}" font-size="36" font-weight="${K.WEIGHT.bold}" fill="${accent}">stage</text>
    <text x="115" y="196" text-anchor="middle" font-family="${FONT.mono}" font-size="94" font-weight="${K.WEIGHT.bold}" fill="${INK}">${label}</text>
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep: '15', tag: 'unmerged index'})}

  <text x="280" y="410" font-family="${FONT.sans}" font-size="230" font-weight="${K.WEIGHT.bold}" letter-spacing="-14" fill="${TOMATO}">冲突</text>
  ${K.mixedText({text: '藏在 Index', x: 880, y: 410, fontSize: 145, fill: INK})}

  ${stage({x: 205, label: '1', accent: INK})}
  <text x="480" y="685" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="64" font-weight="${K.WEIGHT.bold}" fill="${INK}">+</text>
  ${stage({x: 535, label: '2', accent: TEAL})}
  <text x="810" y="685" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="64" font-weight="${K.WEIGHT.bold}" fill="${INK}">+</text>
  ${stage({x: 865, label: '3', accent: TOMATO})}
  <path d="M1175 685 H1395" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>
  <path d="M1353 648 L1403 685 L1353 722" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  ${stage({x: 1485, label: '0', accent: MUSTARD})}
`;

K.render({outDir: 'renders/git-course/ep15-unmerged-index/tmp/cover-candidate', body, previews: true});
