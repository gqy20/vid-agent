#!/usr/bin/env node
// EP01 · Git 不是备份文件夹 —— 乱备份文件夹 ≠ git objects
import * as K from './git-course-cover-kit.mjs';

// 数据区 ────────────────────────────────────────────────
const FOLDER_SHELL = 'M48 110 C50 86 68 72 96 72 H220 C244 72 256 86 266 106 L292 156 H574 C604 156 626 182 620 214 L586 344 C580 370 560 386 530 386 H92 C62 386 42 366 38 338 L20 150 C18 126 26 112 48 110Z';
const FOLDER_COVER = 'M64 176 H590 C602 176 606 180 606 192 V360 C606 372 602 376 590 376 H64 C52 376 48 372 48 360 V192 C48 180 52 176 64 176Z';

const NOTES = [
  {label: '最终版',     x: 290, y: 548, rotate: -12, color: K.OLIVE,  width: 150},
  {label: '最终最终版', x: 448, y: 612, rotate:  -5, color: K.MUTE,   width: 198},
  {label: '打死不改版', x: 560, y: 700, rotate:   5, color: K.MUTE,   width: 210},
  {label: '再改是狗版', x: 536, y: 768, rotate:  10, color: K.TOMATO, width: 198},
];

const STICKERS = [
  {label: 'commit', hash: 'a17c', x: 70,  y: 282, rotate: -7, fill: K.MUSTARD, text: K.INK},
  {label: 'tree',   hash: '3f92', x: 344, y: 424, rotate:  4, fill: K.PAPER,   text: K.INK},
  {label: 'blob',   hash: '8b1a', x: 118, y: 586, rotate:  6, fill: K.TEAL,    text: '#f7f7f4'},
];

// 主视觉 ────────────────────────────────────────────────
const body = `
  ${K.bg()}
  ${K.badge({ep: '01', tag: 'Git objects'})}
  ${K.headline('Git 不是备份文件夹')}
  ${K.subtitle('别再存 final-2.zip')}

  <g transform="translate(76 466) scale(0.94 1.3)">
    <path d="${FOLDER_SHELL}" fill="${K.MUSTARD}" stroke="${K.INK}" stroke-width="6"/>
  </g>
  <g transform="translate(76 466) scale(0.94 1.3)">
    <path d="${FOLDER_COVER}" fill="${K.PAPER}" stroke="${K.INK}" stroke-width="6"/>
  </g>
  <text x="168" y="834" fill="${K.TOMATO}" font-family="${K.FONT.mono}" font-size="76" font-weight="900" transform="rotate(-5 168 834)">final-2</text>

  ${NOTES.map(K.note).join('\n  ')}

  ${K.neq()}

  <g transform="translate(1112 206)">
    <text x="84" y="72" font-family="${K.FONT.mono}" font-size="54" font-weight="900" fill="${K.INK}" transform="rotate(-2 84 72)">.git/objects</text>
    <path d="M202 288 C304 350 394 420 486 502" stroke="${K.INK}" stroke-width="10" fill="none"/>
    <path d="M486 502 C398 560 330 618 244 676" stroke="${K.INK}" stroke-width="10" fill="none"/>
    <path d="M202 288 C154 410 154 550 244 676" stroke="${K.TEAL}" stroke-width="8" fill="none"/>
    <path d="M152 214 C244 158 392 150 506 206 C618 260 642 352 610 432" stroke="${K.TOMATO}" stroke-width="8" fill="none" stroke-dasharray="18 20"/>
    ${STICKERS.map(K.sticker).join('\n    ')}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep01-what-git-stores/renders/current/publishing',
  body,
});
