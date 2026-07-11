#!/usr/bin/env node
// EP01 · Git 不是备份文件夹 —— 乱备份文件夹 ≠ git objects
import * as K from './git-course-cover-kit.mjs';

// 数据区 ────────────────────────────────────────────────
const FOLDER_SHELL = 'M48 110 C50 86 68 72 96 72 H220 C244 72 256 86 266 106 L292 156 H574 C604 156 626 182 620 214 L586 344 C580 370 560 386 530 386 H92 C62 386 42 366 38 338 L20 150 C18 126 26 112 48 110Z';
const FOLDER_COVER = 'M64 176 H590 C602 176 606 180 606 192 V360 C606 372 602 376 590 376 H64 C52 376 48 372 48 360 V192 C48 180 52 176 64 176Z';

const NOTES = [
  {label: '最终版',     x: 565, y: 649, rotate: -12, color: K.OLIVE,  width: 150},
  {label: '最终最终版', x: 586, y: 739, rotate:  -5, color: K.MUTE,   width: 198},
  {label: '打死不改版', x: 594, y: 819, rotate:   5, color: K.MUTE,   width: 210},
  {label: '再改是狗版', x: 573, y: 906, rotate:  10, color: K.TOMATO, width: 198},
];

const STICKERS = [
  {label: 'commit', hash: 'a17c', x: 70,  y: 282, rotate: -7, fill: K.MUSTARD, text: K.INK},
  {label: 'tree',   hash: '3f92', x: 344, y: 424, rotate:  4, fill: K.PAPER,   text: K.INK},
  {label: 'blob',   hash: '8b1a', x: 118, y: 586, rotate:  6, fill: K.TEAL,    text: '#f7f7f4'},
];

// 主视觉 ────────────────────────────────────────────────
const body = `
  ${K.bg({
    c1: {cx: 1510, cy: 679, rx: 523, ry: 534, fill: K.TEAL},
    c2: {cx: 259, cy: 844, rx: 409, ry: 380, fill: K.TOMATO},
  })}
  ${K.badge({ep: '01', tag: 'Git objects'})}
  ${K.headline('Git 不是备份文件夹')}
  ${K.subtitle('别再存 final-2.zip')}

  <g transform="translate(76 466) scale(0.94 1.3)">
    <path d="${FOLDER_SHELL}" fill="${K.MUSTARD}" stroke="${K.INK}" stroke-width="6"/>
  </g>
  <g transform="translate(76 466) scale(0.94 1.3)">
    <path d="${FOLDER_COVER}" fill="${K.PAPER}" stroke="${K.INK}" stroke-width="6"/>
  </g>
  <text x="168" y="834" fill="${K.TOMATO}" font-family="${K.FONT.mono}" font-size="76" font-weight="${K.WEIGHT.bold}" transform="rotate(-5 168 834)">final-2</text>

  ${NOTES.map(K.note).join('\n  ')}

  <text x="579" y="954" font-family="${K.FONT.sans}" font-size="184" font-weight="${K.WEIGHT.bold}" fill="${K.TOMATO}" transform="matrix(0.93879657,-0.27952148,0.29132866,0.97845201,0,0)">≠</text>

  <g transform="translate(1112 206)">
    <text x="98" y="110" font-family="${K.FONT.mono}" font-size="54" font-weight="${K.WEIGHT.bold}" fill="${K.INK}" transform="rotate(-6.9719091)">.git/objects</text>
    <path d="M202 288 C304 350 394 420 486 502" stroke="${K.INK}" stroke-width="10" fill="none"/>
    <path d="M486 502 C398 560 330 618 244 676" stroke="${K.INK}" stroke-width="10" fill="none"/>
    <path d="M202 288 C154 410 154 550 244 676" stroke="${K.TEAL}" stroke-width="8" fill="none"/>
    <path d="M80.490549 209.80552 C185.8489 152.77348 355.33844 144.62605 485.89119 201.65808 C614.15353 256.65327 641.63832 350.34877 604.99194 431.8231" stroke="${K.TOMATO}" stroke-width="8.63964" fill="none" stroke-dasharray="18 20"/>
    ${STICKERS.map(K.sticker).join('\n    ')}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep01-what-git-stores/current/release',
  body,
});
