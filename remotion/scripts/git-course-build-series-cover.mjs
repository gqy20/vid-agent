#!/usr/bin/env node
// Git Course · 课程总封面。
// 与单集封面共享纸张、网格和语义色，但不显示 EP 编号，也不复述单集问题。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const arrow = ({x1, x2, y, color}) => `
  <path d="M${x1} ${y} H${x2 - 34}" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
  <path d="M${x2 - 58} ${y - 28} L${x2} ${y} L${x2 - 58} ${y + 28} Z" fill="${color}"/>`;

const commit = ({x, y, label, fill = PAPER, stroke = INK, text = INK, radius = 58, fontSize = 34}) => `
  <circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="8"/>
  <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="${fontSize}" font-weight="${K.WEIGHT.bold}" fill="${text}">${label}</text>`;

const stateToHistory = `
  <g transform="translate(-50 0)">
    <!-- Working Tree：只保留一个足够大的文件符号。 -->
    <g transform="translate(900 425)">
      ${K.softShadowRect({width: 178, height: 218, rx: 20, dx: 12, dy: 14, opacity: 0.16})}
      <path d="M0 20 Q0 0 20 0 H116 L178 62 V198 Q178 218 158 218 H20 Q0 218 0 198 Z" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
      <path d="M116 0 V62 H178" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
      <path d="M38 108 H140 M38 150 H120" stroke="${TEAL}" stroke-width="12" stroke-linecap="round"/>
      <text x="89" y="280" text-anchor="middle" font-family="${FONT.sans}" font-size="42" font-weight="${K.WEIGHT.bold}" fill="${INK}">文件</text>
    </g>

    ${arrow({x1: 1104, x2: 1190, y: 535, color: MUSTARD})}

    <!-- Index：候选快照，不加入解释性小字。 -->
    <g transform="translate(1210 440)">
      ${K.softShadowRect({width: 190, height: 190, rx: 24, dx: 12, dy: 14, opacity: 0.16})}
      <rect width="190" height="190" rx="24" fill="${PAPER}" stroke="${MUSTARD}" stroke-width="10"/>
      <rect x="38" y="44" width="114" height="102" rx="12" fill="none" stroke="${MUSTARD}" stroke-width="9" stroke-dasharray="15 11"/>
      <path d="M62 78 H128 M62 112 H116" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <text x="95" y="260" text-anchor="middle" font-family="${FONT.mono}" font-size="40" font-weight="${K.WEIGHT.bold}" fill="${INK}">Index</text>
    </g>

    ${arrow({x1: 1426, x2: 1472, y: 535, color: TEAL})}

    <!-- Repository：提交链与 HEAD / main 组成一个稳定的历史模型。 -->
    <g>
      <path d="M1830 288 V346" stroke="${MUSTARD}" stroke-width="9" stroke-linecap="round"/>
      <path d="M1814 334 L1830 350 L1846 334 Z" fill="${MUSTARD}"/>
      <path d="M1830 432 V465" stroke="${TEAL}" stroke-width="9" stroke-linecap="round"/>
      <path d="M1814 453 L1830 469 L1846 453 Z" fill="${TEAL}"/>
      <path d="M1530 535 H1830" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
      ${commit({x: 1530, y: 535, label: 'C0'})}
      ${commit({x: 1680, y: 535, label: 'C1'})}
      ${commit({x: 1830, y: 535, label: 'C2', fill: TEAL, stroke: TEAL, text: PAPER, radius: 66, fontSize: 36})}

      <g transform="translate(1720 200)">
        ${K.softShadowRect({width: 220, height: 88, rx: 20, dx: 9, dy: 10, opacity: 0.16})}
        <rect width="220" height="88" rx="20" fill="${MUSTARD}" stroke="${INK}" stroke-width="7"/>
        <text x="110" y="58" text-anchor="middle" font-family="${FONT.mono}" font-size="36" font-weight="${K.WEIGHT.bold}" fill="${INK}">HEAD</text>
      </g>

      <g transform="translate(1725 350)">
        ${K.softShadowRect({width: 210, height: 82, rx: 19, dx: 9, dy: 10, opacity: 0.14})}
        <rect width="210" height="82" rx="19" fill="${TEAL}" stroke="${INK}" stroke-width="7"/>
        <text x="105" y="55" text-anchor="middle" font-family="${FONT.mono}" font-size="34" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">main</text>
      </g>
      <text x="1680" y="720" text-anchor="middle" font-family="${FONT.sans}" font-size="46" font-weight="${K.WEIGHT.bold}" fill="${INK}">提交历史</text>
    </g>
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1400, cy: 535, rx: 670, ry: 490, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}

  <text x="76" y="326" font-family="${FONT.sans}" font-size="142" font-weight="${K.WEIGHT.bold}" letter-spacing="-6" fill="${INK}">看得见的</text>
  <text x="58" y="686" font-family="${FONT.mono}" font-size="338" font-weight="${K.WEIGHT.bold}" letter-spacing="-16" fill="${TOMATO}">Git</text>

  <g transform="translate(84 790)">
    <rect width="12" height="76" rx="6" fill="${MUSTARD}"/>
    <text x="46" y="55" font-family="${FONT.sans}" font-size="50" font-weight="${K.WEIGHT.bold}" letter-spacing="1" fill="${INK}">把命令还原成状态变化</text>
  </g>

  ${stateToHistory}`;

K.render({outDir: 'renders/git-course/tmp/series-cover', body});
