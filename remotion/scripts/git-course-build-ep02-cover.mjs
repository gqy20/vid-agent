#!/usr/bin/env node
// EP02 · 文件不会直接进 commit —— 工作区 → 暂存区 → 仓库
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, MUTE, FONT, esc} = K;

// 三层容器顶部圆角色条
const topBar = (w, fill) =>
  `<path d="M0 14 C0 6 6 0 14 0 H${w - 14} C${w - 6} 0 ${w} 6 ${w} 14 V70 H0 Z" fill="${fill}"/>`;

// 流程箭头：label 在上，粗箭头在下
const arrow = ({x1, x2, y, label, color = INK}) => `
  <text x="${(x1 + x2) / 2}" y="${y - 30}" text-anchor="middle" font-family="${FONT.mono}" font-size="28" font-weight="700" fill="${color}">${esc(label)}</text>
  <path d="M${x1} ${y} H${x2 - 24}" stroke="${color}" stroke-width="12" fill="none" stroke-linecap="round"/>
  <path d="M${x2 - 28} ${y - 15} L${x2} ${y} L${x2 - 28} ${y + 15} Z" fill="${color}"/>`;

const codeLine = (x, y, w) =>
  `<rect x="${x}" y="${y}" width="${w}" height="10" rx="3" fill="${INK}" fill-opacity="0.18"/>`;

const body = `
  ${K.bg({c1: {cx: 960, cy: 560, r: 560, fill: TEAL}, c2: {cx: 240, cy: 940, r: 340, fill: TOMATO}})}
  ${K.badge({ep: '02', tag: 'three areas'})}
  ${K.headline('文件不会直接进 commit')}
  ${K.subtitle('先 add，再 commit', {width: 440})}

  ${arrow({x1: 548, x2: 736, y: 640, label: 'git add'})}
  ${arrow({x1: 1128, x2: 1308, y: 640, label: 'git commit'})}

  <g transform="translate(148 460)">
    ${K.softShadowRect({width: 400, height: 360, rx: 14})}
    <rect width="400" height="360" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
    ${topBar(400, OLIVE)}
    <text x="200" y="46" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="900" fill="${PAPER}">工作区 · Working Tree</text>
    <g transform="translate(40 100)">
      <rect width="320" height="230" rx="10" fill="#fff" stroke="${INK}" stroke-opacity="0.18" stroke-width="2"/>
      <circle cx="24" cy="26" r="7" fill="${TOMATO}"/>
      <circle cx="46" cy="26" r="7" fill="${MUSTARD}"/>
      <circle cx="68" cy="26" r="7" fill="${TEAL}"/>
      <text x="92" y="32" font-family="${FONT.mono}" font-size="18" font-weight="700" fill="${MUTE}">README.md</text>
      ${codeLine(28, 74, 250)}
      ${codeLine(28, 100, 200)}
      ${codeLine(28, 126, 230)}
      <rect x="28" y="152" width="260" height="12" rx="3" fill="${MUSTARD}"/>
      <rect x="294" y="150" width="3" height="16" fill="${INK}"/>
      ${codeLine(28, 178, 180)}
      ${codeLine(28, 204, 218)}
    </g>
    ${K.note({label: '改了一行', x: 250, y: 88, rotate: 8, color: TOMATO, width: 150})}
  </g>

  <g transform="translate(728 460)">
    ${K.softShadowRect({width: 400, height: 360, rx: 14})}
    <rect width="400" height="360" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
    ${topBar(400, MUSTARD)}
    <text x="200" y="46" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="900" fill="${INK}">暂存区 · Index</text>
    <g transform="translate(80 108)">
      <rect width="240" height="214" rx="12" fill="#fff6df" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8"/>
      <text x="120" y="42" text-anchor="middle" font-family="${FONT.mono}" font-size="22" font-weight="800" fill="${INK}">snapshot</text>
      <rect x="28" y="70" width="68" height="48" rx="6" fill="${MUSTARD}" stroke="${INK}" stroke-width="2"/>
      <rect x="110" y="70" width="68" height="48" rx="6" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
      <rect x="192" y="70" width="40" height="48" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <rect x="28" y="134" width="180" height="38" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <text x="120" y="194" text-anchor="middle" font-family="${FONT.mono}" font-size="15" font-weight="600" fill="${MUTE}">staged for next commit</text>
    </g>
    ${K.note({label: '下次要提交', x: 250, y: 92, rotate: -7, color: OLIVE, width: 178})}
  </g>

  <g transform="translate(1308 460)">
    ${K.softShadowRect({width: 400, height: 360, rx: 14})}
    <rect width="400" height="360" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
    ${topBar(400, TEAL)}
    <text x="200" y="46" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="900" fill="${PAPER}">仓库 · Repository</text>
    <g transform="translate(40 0)">
      <line x1="60" y1="210" x2="280" y2="210" stroke="${INK}" stroke-width="6"/>
      <circle cx="60" cy="210" r="26" fill="${TEAL}" stroke="${INK}" stroke-width="4"/>
      <circle cx="170" cy="210" r="26" fill="${TEAL}" stroke="${INK}" stroke-width="4"/>
      <circle cx="280" cy="210" r="26" fill="${TOMATO}" stroke="${INK}" stroke-width="4"/>
      <text x="60" y="262" text-anchor="middle" font-family="${FONT.mono}" font-size="22" font-weight="800" fill="${INK}">C0</text>
      <text x="170" y="262" text-anchor="middle" font-family="${FONT.mono}" font-size="22" font-weight="800" fill="${INK}">C1</text>
      <text x="280" y="262" text-anchor="middle" font-family="${FONT.mono}" font-size="22" font-weight="800" fill="${INK}">C2</text>
      <line x1="280" y1="184" x2="280" y2="138" stroke="${INK}" stroke-width="3" stroke-dasharray="6 6"/>
      <rect x="230" y="98" width="100" height="40" rx="6" fill="${MUSTARD}" stroke="${INK}" stroke-width="2"/>
      <text x="280" y="125" text-anchor="middle" font-family="${FONT.mono}" font-size="22" font-weight="800" fill="${INK}">main</text>
    </g>
    ${K.note({label: '已提交的历史', x: 24, y: 300, rotate: -4, color: MUTE, width: 210})}
  </g>`;

K.render({
  outDir: 'renders/git-course/ep02-working-tree-index-repo/renders/current/publishing',
  body,
});
