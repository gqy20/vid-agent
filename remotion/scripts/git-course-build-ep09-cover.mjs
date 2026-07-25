#!/usr/bin/env node
// EP09 · diff 先找比较两端：大问题 + 两张快照。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const endpoint = ({x, label, symbol, accent}) => `
  <g transform="translate(${x} 742)">
    ${K.paperShadowRect({width: 510, height: 232, rx: 18})}
    <path d="M0 0 H398 L510 112 V232 H0 Z" fill="${PAPER}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M398 0 V112 H510" fill="${accent}" fill-opacity="0.14" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="105" cy="116" r="61" fill="${accent}" stroke="${INK}" stroke-width="7"/>
    <text x="105" y="137" text-anchor="middle" font-family="${FONT.mono}" font-size="66" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">${label}</text>
    <path d="M205 72 H360" stroke="${INK}" stroke-opacity="0.24" stroke-width="14" stroke-linecap="round"/>
    <path d="M205 132 H376" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>
    <path d="M205 192 H338" stroke="${INK}" stroke-opacity="0.24" stroke-width="14" stroke-linecap="round"/>
    <circle cx="425" cy="132" r="38" fill="${accent}" stroke="${INK}" stroke-width="6"/>
    <text x="425" y="153" text-anchor="middle" font-family="${FONT.mono}" font-size="65" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">${symbol}</text>
  </g>`;

const directionArrow = `
  <path d="M680 858 H1220" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M1172 820 L1236 858 L1172 896 Z" fill="${INK}"/>`;

const body = `
  ${K.bg({
    c1: {cx: 1500, cy: 390, rx: 550, ry: 330, fill: TEAL},
    c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO},
  })}
  ${K.badge({ep: '09', tag: 'diff'})}

  <text x="66" y="538" font-family="${FONT.mono}" font-size="304" font-weight="${K.WEIGHT.bold}" letter-spacing="-13" fill="${TOMATO}">diff</text>
  <text x="1080" y="520" font-family="${FONT.sans}" font-size="188" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">比较谁</text>

  ${endpoint({x: 120, label: 'A', symbol: '−', accent: TOMATO})}
  ${directionArrow}
  ${endpoint({x: 1290, label: 'B', symbol: '+', accent: TEAL})}`;

K.render({outDir: 'renders/git-course/ep09-diff-compares-states/current/release', body});
