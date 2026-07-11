#!/usr/bin/env node
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const folder = (x, y, fill) => `<path transform="translate(${x} ${y})" d="M0 40 Q0 20 20 20 H130 L165 0 H270 Q292 0 305 28 H390 Q410 28 410 48 V190 Q410 210 390 210 H20 Q0 210 0 190 Z" fill="${fill}" stroke="${INK}" stroke-width="6"/>`;
const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '06', tag: 'merge'})}
  <text x="66" y="548" font-family="${FONT.mono}" font-size="300" font-weight="900" letter-spacing="-13" fill="${TOMATO}">merge</text>
  <text x="980" y="320" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">不是</text>
  <text x="980" y="568" font-family="${FONT.sans}" font-size="180" font-weight="900" letter-spacing="-9" fill="${INK}">复制粘贴</text>
  ${folder(90, 785, MUSTARD)}${folder(180, 820, TEAL)}
  <text x="760" y="950" text-anchor="middle" font-family="${FONT.sans}" font-size="160" font-weight="900" fill="${TOMATO}">≠</text>
  <g transform="translate(1040 720)">
    <path d="M40 130 H210 L390 40 M210 130 L390 220 M390 40 L580 130 M390 220 L580 130" fill="none" stroke="${INK}" stroke-width="10"/>
    <circle cx="40" cy="130" r="28" fill="${TEAL}" stroke="${INK}" stroke-width="6"/><circle cx="210" cy="130" r="34" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <circle cx="390" cy="40" r="34" fill="${TEAL}" stroke="${INK}" stroke-width="6"/><circle cx="390" cy="220" r="34" fill="${TOMATO}" stroke="${INK}" stroke-width="6"/>
    <circle cx="580" cy="130" r="42" fill="${PAPER}" stroke="${INK}" stroke-width="7"/>
    <text x="580" y="144" text-anchor="middle" font-family="${FONT.mono}" font-size="30" font-weight="900" fill="${INK}">M</text>
  </g>`;
K.render({outDir: 'renders/git-course/ep06-merge/renders/current/publishing', body});
