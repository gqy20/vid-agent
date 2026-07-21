#!/usr/bin/env node
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const column = ({x, command, fill, target}) => `<g transform="translate(${x} 755)">${K.softShadowRect({width: 500, height: 220, rx: 18, dx: 10, dy: 12, opacity: 0.2})}<rect width="500" height="220" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="6"/><path d="M0 18 Q0 0 18 0 H482 Q500 0 500 18 V72 H0 Z" fill="${fill}"/><text x="250" y="49" text-anchor="middle" font-family="${FONT.mono}" font-size="38" font-weight="${K.WEIGHT.bold}" fill="${fill === MUSTARD ? INK : PAPER}">${command}</text><text x="250" y="158" text-anchor="middle" font-family="${FONT.sans}" font-size="52" font-weight="${K.WEIGHT.bold}" fill="${INK}">${target}</text></g>`;
const body = `
  ${K.bg({c1: {cx: 1450, cy: 390, rx: 560, ry: 330, fill: TEAL}, c2: {cx: 105, cy: 940, rx: 300, ry: 190, fill: TOMATO}})}
  ${K.badge({ep: '08', tag: 'undo'})}
  <text x="186" y="518" font-family="${FONT.sans}" font-size="300" font-weight="${K.WEIGHT.bold}" letter-spacing="-14" fill="${TOMATO}">撤销</text>
  <text x="1000" y="320" font-family="${FONT.sans}" font-size="180" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">不止</text>
  <text x="1000" y="568" font-family="${FONT.sans}" font-size="180" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">一个按钮</text>
  ${column({x: 90, command: 'reset', fill: TOMATO, target: '移动引用'})}
  ${column({x: 710, command: 'revert', fill: MUSTARD, target: '新建提交'})}
  ${column({x: 1330, command: 'restore', fill: TEAL, target: '恢复文件'})}`;
K.render({outDir: 'renders/git-course/ep08-reset-revert-restore/current/release', body});
