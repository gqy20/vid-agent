#!/usr/bin/env node
// EP02 · 小尺寸优先：一个问题 + 一条三层状态流。
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, OLIVE, FONT, esc} = K;

const stage = ({x, width, color, label, english, icon}) => `
  <g transform="translate(${x} 700)">
    ${K.softShadowRect({width, height: 238, rx: 22, dx: 12, dy: 14, opacity: 0.2})}
    <rect width="${width}" height="238" rx="22" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <rect width="${width}" height="30" rx="15" fill="${color}"/>
    ${icon}
    <text x="${width / 2}" y="174" text-anchor="middle" font-family="${FONT.sans}" font-size="56" font-weight="900" fill="${INK}">${esc(label)}</text>
    <text x="${width / 2}" y="216" text-anchor="middle" font-family="${FONT.mono}" font-size="23" font-weight="800" fill="${INK}" fill-opacity="0.55">${esc(english)}</text>
  </g>`;

const flowArrow = ({x1, x2, label, color}) => `
  <g>
    <text x="${(x1 + x2) / 2}" y="796" text-anchor="middle" font-family="${FONT.mono}" font-size="24" font-weight="900" fill="${color}">${esc(label)}</text>
    <path d="M${x1} 850 H${x2 - 34}" stroke="${color}" stroke-width="18" stroke-linecap="round"/>
    <path d="M${x2 - 42} 822 L${x2} 850 L${x2 - 42} 878 Z" fill="${color}"/>
  </g>`;

const fileIcon = `
  <g transform="translate(202 42) scale(0.75)">
    <path d="M0 0 H70 L98 28 V70 H0 Z" fill="${OLIVE}"/>
    <path d="M70 0 V28 H98" fill="none" stroke="${PAPER}" stroke-width="7"/>
  </g>`;

const indexIcon = `
  <g transform="translate(198 42) scale(0.75)">
    <rect width="108" height="62" rx="8" fill="none" stroke="${MUSTARD}" stroke-width="9" stroke-dasharray="15 10"/>
    <rect x="21" y="18" width="66" height="26" rx="5" fill="${MUSTARD}"/>
  </g>`;

const repoIcon = `
  <g transform="translate(194 48) scale(0.75)">
    <path d="M10 20 H118" stroke="${TEAL}" stroke-width="10"/>
    <circle cx="10" cy="20" r="17" fill="${TEAL}" stroke="${INK}" stroke-width="5"/>
    <circle cx="64" cy="20" r="17" fill="${TEAL}" stroke="${INK}" stroke-width="5"/>
    <circle cx="118" cy="20" r="17" fill="${TOMATO}" stroke="${INK}" stroke-width="5"/>
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL},
    c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO},
  })}

  ${K.badge({ep: '02', tag: 'three areas'})}

  <text x="66" y="326" font-family="${FONT.sans}" font-size="210" font-weight="900" letter-spacing="-10" fill="${INK}">文件不会</text>
  <text x="66" y="584" font-family="${FONT.sans}" font-size="210" font-weight="900" letter-spacing="-10" fill="${INK}">直接进</text>
  <text x="865" y="558" font-family="${FONT.mono}" font-size="300" font-weight="900" letter-spacing="-13" fill="${TOMATO}">commit</text>

  ${stage({x: 66, width: 478, color: OLIVE, label: '工作区', english: 'Working Tree', icon: fileIcon})}
  ${flowArrow({x1: 570, x2: 704, label: 'git add', color: OLIVE})}
  ${stage({x: 720, width: 478, color: MUSTARD, label: '暂存区', english: 'Index', icon: indexIcon})}
  ${flowArrow({x1: 1224, x2: 1358, label: 'git commit', color: TEAL})}
  ${stage({x: 1374, width: 478, color: TEAL, label: '仓库', english: 'Repository', icon: repoIcon})}`;

K.render({
  outDir: 'renders/git-course/ep02-working-tree-index-repo/renders/current/publishing',
  body,
});
