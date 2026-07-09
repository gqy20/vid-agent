#!/usr/bin/env node
// EP05 · HEAD 不是最新版本号 —— HEAD 指向当前分支，当前分支再指向 commit
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

const node = ({x, y, label, fill = TEAL, text = PAPER}) => `
  <circle cx="${x}" cy="${y}" r="34" fill="${fill}" stroke="${INK}" stroke-width="5"/>
  <text x="${x}" y="${y + 72}" text-anchor="middle" font-family="${FONT.mono}" font-size="26" font-weight="800" fill="${INK}">${esc(label)}</text>`;

const ref = ({x, y, label, fill, width = 160}) => `
  <rect x="${x}" y="${y}" width="${width}" height="56" rx="8" fill="${fill}" stroke="${INK}" stroke-width="4"/>
  <text x="${x + width / 2}" y="${y + 38}" text-anchor="middle" font-family="${FONT.mono}" font-size="28" font-weight="900" fill="${fill === TOMATO ? PAPER : INK}">${esc(label)}</text>`;

const body = `
  ${K.bg({c1: {cx: 1340, cy: 610, r: 500, fill: TEAL}, c2: {cx: 250, cy: 820, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '05', tag: 'HEAD'})}
  ${K.headline('HEAD 不是最新版本号')}
  ${K.subtitle('它回答：我站在哪', {width: 430})}

  <g transform="translate(88 498)">
    ${K.softShadowRect({width: 500, height: 250, rx: 16})}
    <rect width="500" height="250" rx="16" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
    <text x="58" y="92" font-family="${FONT.mono}" font-size="56" font-weight="900" fill="${TOMATO}">HEAD = latest?</text>
    <line x1="54" y1="126" x2="452" y2="126" stroke="${TOMATO}" stroke-width="14" stroke-linecap="round"/>
    <text x="250" y="202" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="800" fill="${MUTE}">它不是另一个版本</text>
  </g>

  ${K.neq({x: 740, y: 664})}

  <g transform="translate(1000 404)">
    ${ref({x: 60, y: 0, label: 'HEAD', fill: TOMATO, width: 150})}
    ${ref({x: 295, y: 0, label: 'main', fill: MUSTARD, width: 150})}
    <path d="M212 28 H288" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M282 12 L308 28 L282 44 Z" fill="${INK}"/>

    <line x1="370" y1="58" x2="370" y2="176" stroke="${INK}" stroke-width="4" stroke-dasharray="8 8"/>
    <line x1="150" y1="220" x2="590" y2="220" stroke="${INK}" stroke-width="7"/>
    ${node({x: 150, y: 220, label: 'C0'})}
    ${node({x: 300, y: 220, label: 'C1'})}
    ${node({x: 450, y: 220, label: 'C2', fill: TOMATO})}
    <path d="M370 176 L438 205" stroke="${INK}" stroke-width="5" stroke-dasharray="8 8"/>
    ${K.note({label: 'HEAD -> main -> C2', x: 110, y: 338, rotate: -4, color: OLIVE, width: 310})}
    ${K.note({label: 'switch 会改 HEAD', x: 442, y: 360, rotate: 5, color: MUTE, width: 240})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep05-head/renders/current/publishing',
  body,
});
