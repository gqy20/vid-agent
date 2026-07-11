#!/usr/bin/env node
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '05', tag: 'HEAD'})}
  <text x="66" y="548" font-family="${FONT.mono}" font-size="330" font-weight="${K.WEIGHT.bold}" letter-spacing="-14" fill="${TOMATO}">HEAD</text>
  <text x="920" y="320" font-family="${FONT.sans}" font-size="180" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">不是</text>
  <text x="920" y="568" font-family="${FONT.sans}" font-size="180" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">最新版本</text>
  <g transform="translate(270 760)">
    <rect width="300" height="88" rx="16" fill="${TOMATO}" stroke="${INK}" stroke-width="6"/>
    <text x="150" y="59" text-anchor="middle" font-family="${FONT.mono}" font-size="45" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">HEAD</text>
    <path d="M310 44 H500" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M480 20 L530 44 L480 68 Z" fill="${INK}"/>
    <rect x="540" width="300" height="88" rx="16" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <text x="690" y="59" text-anchor="middle" font-family="${FONT.mono}" font-size="45" font-weight="${K.WEIGHT.bold}" fill="${INK}">main</text>
    <path d="M850 44 H1040" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M1020 20 L1070 44 L1020 68 Z" fill="${INK}"/>
    <circle cx="1160" cy="44" r="55" fill="${TEAL}" stroke="${INK}" stroke-width="7"/>
    <text x="1160" y="150" text-anchor="middle" font-family="${FONT.mono}" font-size="32" font-weight="${K.WEIGHT.bold}" fill="${INK}">commit</text>
  </g>`;
K.render({outDir: 'renders/git-course/ep05-head/current/release', body});
