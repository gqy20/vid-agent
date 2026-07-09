#!/usr/bin/env node
// EP06 · Merge 不是复制粘贴 —— 历史形状决定 fast-forward 或 merge commit
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

const folder = ({x, y, scale = 1, fill = PAPER, label, rotate = 0}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">
    <path d="M38 74 C40 56 54 48 76 48 H174 C194 48 204 58 212 74 L234 112 H442 C466 112 482 130 478 154 L454 278 C450 302 434 316 408 316 H70 C46 316 30 302 28 278 L16 110 C14 88 22 76 38 74Z" fill="${fill}" stroke="${INK}" stroke-width="6"/>
    <text x="244" y="208" text-anchor="middle" font-family="${FONT.mono}" font-size="30" font-weight="900" fill="${fill === TEAL ? PAPER : INK}">${esc(label)}</text>
  </g>`;

const commit = ({x, y, label, fill = TEAL}) => `
  <circle cx="${x}" cy="${y}" r="30" fill="${fill}" stroke="${INK}" stroke-width="5"/>
  <text x="${x}" y="${y + 68}" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="800" fill="${INK}">${esc(label)}</text>`;

const body = `
  ${K.bg({c1: {cx: 1350, cy: 620, r: 520, fill: TEAL}, c2: {cx: 255, cy: 800, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '06', tag: 'merge'})}
  ${K.headline('Merge 不是复制粘贴')}
  ${K.subtitle('先看历史有没有分叉', {width: 500})}

  ${folder({x: 70, y: 520, scale: 1.08, fill: MUSTARD, label: 'project-main', rotate: -7})}
  ${folder({x: 170, y: 610, scale: 1.08, fill: TEAL, label: 'project-feature', rotate: 5})}
  ${K.note({label: '不是把两个文件夹揉一起', x: 56, y: 470, rotate: -10, color: TOMATO, width: 300})}

  ${K.neq({x: 790, y: 665})}

  <g transform="translate(1030 302)">
    <line x1="120" y1="320" x2="330" y2="320" stroke="${INK}" stroke-width="7"/>
    <line x1="330" y1="320" x2="510" y2="214" stroke="${INK}" stroke-width="7"/>
    <line x1="330" y1="320" x2="510" y2="426" stroke="${INK}" stroke-width="7"/>
    <line x1="510" y1="214" x2="682" y2="320" stroke="${INK}" stroke-width="7"/>
    <line x1="510" y1="426" x2="682" y2="320" stroke="${INK}" stroke-width="7"/>
    ${commit({x: 120, y: 320, label: 'C1'})}
    ${commit({x: 330, y: 320, label: 'base', fill: MUSTARD})}
    ${commit({x: 510, y: 214, label: 'ours', fill: TEAL})}
    ${commit({x: 510, y: 426, label: 'theirs', fill: TOMATO})}
    ${commit({x: 682, y: 320, label: 'M1', fill: PAPER})}
    ${K.note({label: '三方合并', x: 250, y: 30, rotate: -4, color: OLIVE, width: 180})}
    ${K.note({label: 'M1 有两个 parent', x: 460, y: 520, rotate: 5, color: MUTE, width: 260})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep06-merge/renders/current/publishing',
  body,
});
