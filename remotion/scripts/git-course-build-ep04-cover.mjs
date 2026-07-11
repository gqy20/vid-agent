#!/usr/bin/env node
// EP04 · 小尺寸优先：branch ≠ 项目副本。
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const folder = `
  <g transform="translate(116 775)">
    ${K.softShadowRect({x: 0, y: 30, width: 430, height: 190, rx: 18, dx: 10, dy: 12, opacity: 0.2})}
    <path d="M18 52 Q18 30 40 30 H164 L202 0 H300 Q324 0 338 30 H410 Q430 30 430 52 V202 Q430 220 410 220 H38 Q18 220 18 202 Z" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <text x="224" y="144" text-anchor="middle" font-family="${FONT.sans}" font-size="55" font-weight="900" fill="${INK}">项目副本</text>
  </g>`;

const pointerModel = `
  <g transform="translate(1074 742)">
    ${K.softShadowRect({width: 700, height: 250, rx: 18, dx: 10, dy: 12, opacity: 0.2})}
    <rect width="700" height="250" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <rect x="72" y="34" width="170" height="58" rx="12" fill="${MUSTARD}" stroke="${INK}" stroke-width="4"/>
    <text x="157" y="75" text-anchor="middle" font-family="${FONT.mono}" font-size="32" font-weight="900" fill="${INK}">main</text>
    <rect x="458" y="34" width="170" height="58" rx="12" fill="${TOMATO}" stroke="${INK}" stroke-width="4"/>
    <text x="543" y="75" text-anchor="middle" font-family="${FONT.mono}" font-size="30" font-weight="900" fill="${PAPER}">feature</text>
    <path d="M157 94 L320 172" stroke="${INK}" stroke-width="6" stroke-dasharray="12 10"/>
    <path d="M543 94 L380 172" stroke="${INK}" stroke-width="6" stroke-dasharray="12 10"/>
    <line x1="164" y1="192" x2="536" y2="192" stroke="${INK}" stroke-width="9"/>
    <circle cx="164" cy="192" r="25" fill="${TEAL}" stroke="${INK}" stroke-width="6"/>
    <circle cx="350" cy="192" r="31" fill="${TOMATO}" stroke="${INK}" stroke-width="6"/>
    <circle cx="536" cy="192" r="25" fill="${TEAL}" stroke="${INK}" stroke-width="6"/>
  </g>`;

const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '04', tag: 'branch pointer'})}

  <text x="66" y="548" font-family="${FONT.mono}" font-size="270" font-weight="900" letter-spacing="-12" fill="${TOMATO}">branch</text>
  <text x="1030" y="320" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">不是</text>
  <text x="1030" y="568" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">项目副本</text>

  ${folder}
  <text x="824" y="930" text-anchor="middle" font-family="${FONT.sans}" font-size="170" font-weight="900" fill="${TOMATO}">≠</text>
  ${pointerModel}`;

K.render({
  outDir: 'renders/git-course/ep04-branch-is-pointer/current/release',
  body,
});
