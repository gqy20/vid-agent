#!/usr/bin/env node
// EP06 · 延续 EP02–05 的封面骨架：大标题 + 一块提交图模型。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, TOMATO, TEAL, FONT} = K;

const commit = ({x, y, label, fill = PAPER, stroke = INK, text = INK, radius = 50, fontSize = 30}) => `
  <circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="6"/>
  <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="${fontSize}" font-weight="${K.WEIGHT.bold}" fill="${text}">${label}</text>`;

const graphBoard = `
  <g transform="translate(0 0)">
    <text x="475" y="744" text-anchor="middle" font-family="${FONT.sans}" font-size="68" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">快进</text>
    <path d="M190 930 H760" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M306 836 H646" fill="none" stroke="${TEAL}" stroke-width="12" stroke-linecap="round"/>
    <path d="M620 808 L670 836 L620 864 Z" fill="${TEAL}"/>
    ${commit({x: 190, y: 930, label: 'C2', radius: 54})}
    ${commit({x: 760, y: 930, label: 'C3', fill: TEAL, stroke: TEAL, text: PAPER, radius: 60, fontSize: 32})}

    <text x="1370" y="744" text-anchor="middle" font-family="${FONT.sans}" font-size="68" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">合并</text>
    <path d="M1080 930 L1370 830 L1710 930 M1080 930 L1370 1006 L1710 930" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    ${commit({x: 1080, y: 930, label: 'C2', radius: 54})}
    ${commit({x: 1370, y: 830, label: 'C3', stroke: TEAL, radius: 48, fontSize: 28})}
    ${commit({x: 1370, y: 1006, label: 'C4', stroke: TOMATO, radius: 48, fontSize: 28})}
    ${commit({x: 1710, y: 930, label: 'M1', fill: TEAL, stroke: TEAL, text: PAPER, radius: 60, fontSize: 32})}
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1450, cy: 350, rx: 560, ry: 330, fill: TEAL},
    c2: {cx: -120, cy: 1110, rx: 300, ry: 190, fill: TOMATO},
  })}
  ${K.badge({ep: '06', tag: 'merge'})}

  <text x="66" y="488" font-family="${FONT.mono}" font-size="285" font-weight="${K.WEIGHT.bold}" letter-spacing="-12" fill="${TOMATO}">merge</text>
  <text x="1060" y="320" font-family="${FONT.sans}" font-size="184" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">先看</text>
  <text x="1060" y="568" font-family="${FONT.sans}" font-size="184" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">提交图</text>

  ${graphBoard}`;

K.render({outDir: 'renders/git-course/ep06-merge/current/release', body});
