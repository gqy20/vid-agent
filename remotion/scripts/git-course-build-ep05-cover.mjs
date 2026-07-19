#!/usr/bin/env node
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, TOMATO, TEAL, FONT} = K;

const HEAD = '#b98723';

const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 25, cy: 1005, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '05', tag: 'HEAD'})}
  <text x="66" y="530" font-family="${FONT.mono}" font-size="300" font-weight="${K.WEIGHT.bold}" letter-spacing="-12" fill="${HEAD}">HEAD</text>
  <text x="1080" y="312" font-family="${FONT.sans}" font-size="176" font-weight="${K.WEIGHT.bold}" letter-spacing="-8" fill="${INK}">到底</text>
  <text x="1080" y="560" font-family="${FONT.sans}" font-size="176" font-weight="${K.WEIGHT.bold}" letter-spacing="-8" fill="${INK}">指向谁</text>
  <g transform="translate(180 770)">
    <rect width="340" height="108" rx="20" fill="${PAPER}" stroke="${HEAD}" stroke-width="10"/>
    <text x="170" y="73" text-anchor="middle" font-family="${FONT.mono}" font-size="50" font-weight="${K.WEIGHT.bold}" fill="${HEAD}">HEAD</text>
    <path d="M360 54 H560" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M536 26 L590 54 L536 82 Z" fill="${INK}"/>
    <rect x="600" width="340" height="108" rx="20" fill="${TEAL}" stroke="${INK}" stroke-width="8"/>
    <text x="770" y="73" text-anchor="middle" font-family="${FONT.mono}" font-size="50" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">main</text>
    <path d="M960 54 H1160" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M1136 26 L1190 54 L1136 82 Z" fill="${INK}"/>
    <circle cx="1300" cy="54" r="72" fill="${PAPER}" stroke="${INK}" stroke-width="10"/>
    <text x="1300" y="71" text-anchor="middle" font-family="${FONT.mono}" font-size="48" font-weight="${K.WEIGHT.bold}" fill="${INK}">C2</text>
    <text x="1300" y="184" text-anchor="middle" font-family="${FONT.mono}" font-size="50" font-weight="${K.WEIGHT.bold}" fill="${INK}">commit</text>
  </g>`;
K.render({outDir: 'renders/git-course/ep05-head/current/release', body});
