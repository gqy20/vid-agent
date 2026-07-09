#!/usr/bin/env node
// EP04 · Branch 不是项目副本 —— 项目副本堆 ≠ commit链 + main/feature 指针
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

// 复用 folder 轮廓表达"笨重的项目副本"（与 ep01 的备份 folder 呼应）
const FOLDER = 'M48 110 C50 86 68 72 96 72 H220 C244 72 256 86 266 106 L292 156 H574 C604 156 626 182 620 214 L586 344 C580 370 560 386 530 386 H92 C62 386 42 366 38 338 L20 150 C18 126 26 112 48 110Z';

const body = `
  ${K.bg({c1: {cx: 1380, cy: 600, r: 460, fill: TEAL}, c2: {cx: 260, cy: 820, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '04', tag: 'branch pointer'})}
  ${K.headline('Branch 不是项目副本')}
  ${K.subtitle('它只是一个指针', {width: 380})}

  <g transform="translate(70 522) scale(0.88) rotate(-9)">
    <path d="${FOLDER}" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <text x="300" y="250" text-anchor="middle" font-family="${FONT.mono}" font-size="32" font-weight="880" fill="${INK}">my-project</text>
  </g>
  <g transform="translate(158 558) scale(0.88) rotate(6)">
    <path d="${FOLDER}" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <text x="300" y="250" text-anchor="middle" font-family="${FONT.mono}" font-size="32" font-weight="880" fill="${INK}">my-project-v2</text>
  </g>
  <g transform="translate(110 604) scale(0.88) rotate(-3)">
    <path d="${FOLDER}" fill="${TEAL}" stroke="${INK}" stroke-width="6"/>
    <text x="300" y="250" text-anchor="middle" font-family="${FONT.mono}" font-size="28" font-weight="880" fill="${PAPER}">my-project-copy</text>
  </g>
  ${K.note({label: '复制了整个项目？', x: 30, y: 450, rotate: -11, color: TOMATO, width: 240})}

  ${K.neq({x: 808, y: 660})}

  <g transform="translate(910 -34) scale(1.2)">
    <line x1="180" y1="640" x2="400" y2="640" stroke="${INK}" stroke-width="6"/>
    <circle cx="180" cy="640" r="30" fill="${TEAL}" stroke="${INK}" stroke-width="5"/>
    <circle cx="290" cy="640" r="30" fill="${TEAL}" stroke="${INK}" stroke-width="5"/>
    <circle cx="400" cy="640" r="30" fill="${TOMATO}" stroke="${INK}" stroke-width="5"/>
    <text x="180" y="704" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="840" fill="${INK}">C0</text>
    <text x="290" y="704" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="840" fill="${INK}">C1</text>
    <text x="400" y="704" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="840" fill="${INK}">C2</text>

    <line x1="400" y1="612" x2="300" y2="544" stroke="${INK}" stroke-width="3" stroke-dasharray="6 6"/>
    <rect x="232" y="498" width="130" height="46" rx="8" fill="${MUSTARD}" stroke="${INK}" stroke-width="3"/>
    <text x="297" y="530" text-anchor="middle" font-family="${FONT.mono}" font-size="26" font-weight="900" fill="${INK}">main</text>

    <line x1="400" y1="612" x2="500" y2="544" stroke="${INK}" stroke-width="3" stroke-dasharray="6 6"/>
    <rect x="438" y="498" width="150" height="46" rx="8" fill="${TOMATO}" stroke="${INK}" stroke-width="3"/>
    <text x="513" y="530" text-anchor="middle" font-family="${FONT.mono}" font-size="26" font-weight="900" fill="${PAPER}">feature</text>

    ${K.note({label: '两个名字，都指向 C2', x: 118, y: 732, rotate: -3, color: OLIVE, width: 290})}
    ${K.note({label: '没复制任何东西', x: 410, y: 752, rotate: 5, color: MUTE, width: 220})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep04-branch-is-pointer/renders/current/publishing',
  body,
});
