#!/usr/bin/env node
// EP07 · Rebase 不是搬分支 —— 提取 patch，在新 base 上 replay，生成新身份
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

const commit = ({x, y, label, fill = TEAL, text = INK}) => `
  <circle cx="${x}" cy="${y}" r="30" fill="${fill}" stroke="${INK}" stroke-width="5"/>
  <text x="${x}" y="${y + 70}" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="800" fill="${text}">${esc(label)}</text>`;

const patchCard = ({x, y, label, rotate = 0}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate})">
    ${K.paperShadowRect({width: 230, height: 92, rx: 10})}
    <rect width="230" height="92" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8"/>
    <text x="115" y="57" text-anchor="middle" font-family="${FONT.mono}" font-size="28" font-weight="900" fill="${TOMATO}">${esc(label)}</text>
  </g>`;

const body = `
  ${K.bg({c1: {cx: 1355, cy: 620, r: 520, fill: TEAL}, c2: {cx: 260, cy: 810, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '07', tag: 'rebase'})}
  ${K.headline('Rebase 不是搬分支')}
  ${K.subtitle('它会重新播放修改', {width: 460})}

  <g transform="translate(92 500)">
    <line x1="74" y1="250" x2="300" y2="250" stroke="${INK}" stroke-width="7"/>
    <line x1="300" y1="250" x2="510" y2="140" stroke="${INK}" stroke-width="7"/>
    <line x1="300" y1="250" x2="510" y2="360" stroke="${INK}" stroke-width="7"/>
    ${commit({x: 74, y: 250, label: 'C1'})}
    ${commit({x: 300, y: 250, label: 'C2', fill: MUSTARD})}
    ${commit({x: 510, y: 140, label: 'main', fill: TEAL})}
    ${commit({x: 510, y: 360, label: 'C4', fill: TOMATO, text: PAPER})}
    ${K.note({label: '不是把 C4 平移过去', x: 110, y: 14, rotate: -8, color: TOMATO, width: 280})}
  </g>

  ${K.neq({x: 790, y: 665})}

  <g transform="translate(1038 390)">
    ${patchCard({x: 20, y: 120, label: 'patch C4', rotate: -6})}
    <path d="M278 166 C384 108 480 92 590 120" stroke="${INK}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M568 94 L608 126 L560 140 Z" fill="${INK}"/>
    <line x1="360" y1="330" x2="680" y2="330" stroke="${INK}" stroke-width="7"/>
    ${commit({x: 360, y: 330, label: 'main', fill: TEAL})}
    ${commit({x: 530, y: 330, label: "C4'", fill: TOMATO, text: PAPER})}
    <rect x="456" y="130" width="260" height="86" rx="10" fill="${MUSTARD}" stroke="${INK}" stroke-width="4"/>
    <text x="586" y="184" text-anchor="middle" font-family="${FONT.mono}" font-size="32" font-weight="900" fill="${INK}">replay</text>
    ${K.note({label: 'parent 变，hash 变', x: 382, y: 430, rotate: 4, color: MUTE, width: 250})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep07-rebase/renders/current/publishing',
  body,
});
