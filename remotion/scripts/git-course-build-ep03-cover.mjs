#!/usr/bin/env node
// EP03 · 小尺寸优先：commit ≠ 保存按钮。
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, MUTE, FONT} = K;

const floppy = `
  <g transform="translate(196 760)">
    ${K.softShadowRect({width: 260, height: 220, rx: 18, dx: 10, dy: 12, opacity: 0.2})}
    <rect width="260" height="220" rx="18" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <rect x="48" width="164" height="82" fill="#dfe0d4" stroke="${INK}" stroke-width="5"/>
    <rect x="158" y="18" width="38" height="48" fill="${INK}"/>
    <rect x="48" y="112" width="164" height="82" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
    <line x1="72" y1="142" x2="188" y2="142" stroke="${MUTE}" stroke-width="5"/>
    <line x1="72" y1="166" x2="170" y2="166" stroke="${MUTE}" stroke-width="5"/>
  </g>`;

const commitObject = `
  <g transform="translate(1126 742)">
    ${K.softShadowRect({width: 612, height: 250, rx: 18, dx: 10, dy: 12, opacity: 0.2})}
    <rect width="612" height="250" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <path d="M0 18 Q0 0 18 0 H594 Q612 0 612 18 V56 H0 Z" fill="${MUSTARD}"/>
    <text x="30" y="39" font-family="${FONT.mono}" font-size="27" font-weight="900" fill="${INK}">commit object</text>
    <text x="42" y="116" font-family="${FONT.mono}" font-size="38" font-weight="900" fill="${TEAL}">tree</text>
    <path d="M176 104 H480" stroke="${TEAL}" stroke-width="10" stroke-linecap="round"/>
    <path d="M472 88 L508 104 L472 120 Z" fill="${TEAL}"/>
    <text x="42" y="194" font-family="${FONT.mono}" font-size="38" font-weight="900" fill="${TOMATO}">parent</text>
    <path d="M214 182 H480" stroke="${TOMATO}" stroke-width="10" stroke-linecap="round"/>
    <path d="M472 166 L508 182 L472 198 Z" fill="${TOMATO}"/>
    <circle cx="548" cy="104" r="20" fill="${TEAL}" stroke="${INK}" stroke-width="5"/>
    <circle cx="548" cy="182" r="20" fill="${TOMATO}" stroke="${INK}" stroke-width="5"/>
  </g>`;

const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '03', tag: 'commit object'})}

  <text x="66" y="548" font-family="${FONT.mono}" font-size="285" font-weight="900" letter-spacing="-12" fill="${TOMATO}">commit</text>
  <text x="1060" y="320" font-family="${FONT.sans}" font-size="190" font-weight="900" letter-spacing="-9" fill="${INK}">不是</text>
  <text x="1060" y="568" font-family="${FONT.sans}" font-size="190" font-weight="900" letter-spacing="-9" fill="${INK}">保存按钮</text>

  ${floppy}
  <text x="824" y="930" text-anchor="middle" font-family="${FONT.sans}" font-size="170" font-weight="900" fill="${TOMATO}">≠</text>
  ${commitObject}`;

K.render({
  outDir: 'renders/git-course/ep03-commit-snapshot/renders/current/publishing',
  body,
});
