#!/usr/bin/env node
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '07', tag: 'rebase'})}
  <text x="66" y="548" font-family="${FONT.mono}" font-size="286" font-weight="900" letter-spacing="-13" fill="${TOMATO}">rebase</text>
  <text x="1080" y="320" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">不是</text>
  <text x="1080" y="568" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">搬分支</text>
  <g transform="translate(150 770)">
    <rect width="330" height="150" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="6" stroke-dasharray="16 12"/>
    <text x="165" y="94" text-anchor="middle" font-family="${FONT.mono}" font-size="43" font-weight="900" fill="${TOMATO}">patch</text>
    <path d="M350 75 H640" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M620 48 L674 75 L620 102 Z" fill="${INK}"/>
    <rect x="700" y="20" width="330" height="110" rx="18" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <text x="865" y="91" text-anchor="middle" font-family="${FONT.mono}" font-size="43" font-weight="900" fill="${INK}">replay</text>
    <path d="M1050 75 H1260" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M1240 48 L1294 75 L1240 102 Z" fill="${INK}"/>
    <circle cx="1390" cy="75" r="58" fill="${TOMATO}" stroke="${INK}" stroke-width="7"/>
    <text x="1390" y="185" text-anchor="middle" font-family="${FONT.mono}" font-size="34" font-weight="900" fill="${INK}">new commit</text>
  </g>`;
K.render({outDir: 'renders/git-course/ep07-rebase/current/release', body});
