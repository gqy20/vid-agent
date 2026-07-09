#!/usr/bin/env node
// EP08 · 撤销不是一个按钮 —— reset / revert / restore 改的是不同对象
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

const pill = ({x, y, label, fill, width = 210}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height: 74, rx: 10})}
    <rect width="${width}" height="74" rx="10" fill="${fill}" stroke="${INK}" stroke-width="4"/>
    <text x="${width / 2}" y="48" text-anchor="middle" font-family="${FONT.mono}" font-size="30" font-weight="900" fill="${fill === TOMATO || fill === TEAL ? PAPER : INK}">${esc(label)}</text>
  </g>`;

const tree = ({x, y, label, fill, note}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width: 360, height: 260, rx: 14})}
    <rect width="360" height="260" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
    <path d="M0 14 C0 6 6 0 14 0 H346 C354 0 360 6 360 14 V66 H0 Z" fill="${fill}"/>
    <text x="180" y="43" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="900" fill="${fill === MUSTARD ? INK : PAPER}">${esc(label)}</text>
    <text x="180" y="138" text-anchor="middle" font-family="${FONT.sans}" font-size="31" font-weight="800" fill="${INK}">${esc(note)}</text>
    <rect x="58" y="176" width="244" height="18" rx="5" fill="${INK}" fill-opacity="0.16"/>
    <rect x="58" y="210" width="176" height="18" rx="5" fill="${INK}" fill-opacity="0.13"/>
  </g>`;

const body = `
  ${K.bg({c1: {cx: 1260, cy: 620, r: 540, fill: TEAL}, c2: {cx: 270, cy: 820, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '08', tag: 'undo'})}
  ${K.headline('撤销不是一个按钮')}
  ${K.subtitle('先问：改哪一层？', {width: 440})}

  <g transform="translate(94 522)">
    ${K.softShadowRect({width: 430, height: 300, rx: 18})}
    <rect width="430" height="300" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
    <circle cx="150" cy="145" r="44" fill="${TOMATO}" stroke="${INK}" stroke-width="5"/>
    <text x="150" y="156" text-anchor="middle" font-family="${FONT.mono}" font-size="30" font-weight="900" fill="${PAPER}">C3</text>
    <text x="252" y="136" font-family="${FONT.sans}" font-size="31" font-weight="900" fill="${INK}">错误提交</text>
    <text x="252" y="180" font-family="${FONT.mono}" font-size="24" font-weight="700" fill="${MUTE}">undo?</text>
    <text x="214" y="256" text-anchor="middle" font-family="${FONT.sans}" font-size="34" font-weight="900" fill="${TOMATO}">一个按钮不够</text>
  </g>

  ${K.neq({x: 738, y: 672})}

  <g transform="translate(940 320)">
    ${pill({x: 20, y: 0, label: 'reset', fill: TOMATO})}
    ${pill({x: 270, y: 0, label: 'revert', fill: MUSTARD})}
    ${pill({x: 520, y: 0, label: 'restore', fill: TEAL})}
    ${tree({x: 0, y: 146, label: 'HEAD', fill: TOMATO, note: '移动引用'})}
    ${tree({x: 400, y: 146, label: 'Index', fill: MUSTARD, note: '准备提交'})}
    ${tree({x: 200, y: 400, label: 'Working Tree', fill: TEAL, note: '恢复文件'})}
    ${K.note({label: 'revert 会写新提交', x: 452, y: 370, rotate: -5, color: OLIVE, width: 270})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep08-reset-revert-restore/renders/current/publishing',
  body,
});
