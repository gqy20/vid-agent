#!/usr/bin/env node
// EP13 · fetch / pull / push 分别改动不同边界。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const boundaryCard = ({x, title, accent, rows}) => `
  <g transform="translate(${x} 690)">
    ${K.softShadowRect({width: 430, height: 310, rx: 24, dx: 12, dy: 14, opacity: 0.16})}
    <rect width="430" height="310" rx="24" fill="${PAPER}" stroke="${accent}" stroke-width="9"/>
    <text x="30" y="58" font-family="${FONT.sans}" font-size="37" font-weight="${K.WEIGHT.bold}" fill="${INK}">${title}</text>
    ${rows.map((row, index) => `
      <rect x="28" y="${92 + index * 78}" width="374" height="58" rx="12" fill="${row.fill}" fill-opacity="0.15"/>
      <text x="50" y="${131 + index * 78}" font-family="${FONT.mono}" font-size="28" font-weight="${K.WEIGHT.bold}" fill="${row.fill}">${row.label}</text>`).join('')}
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1680, cy: 430, rx: 520, ry: 330, fill: TEAL},
    c2: {cx: 20, cy: 1020, rx: 250, ry: 160, fill: TOMATO},
  })}
  ${K.badge({ep: '13', tag: 'remote flow'})}

  <text x="66" y="335" font-family="${FONT.mono}" font-size="178" font-weight="${K.WEIGHT.bold}" letter-spacing="-10" fill="${MUSTARD}">fetch</text>
  <text x="66" y="535" font-family="${FONT.mono}" font-size="178" font-weight="${K.WEIGHT.bold}" letter-spacing="-10" fill="${TEAL}">pull</text>
  <text x="66" y="735" font-family="${FONT.mono}" font-size="178" font-weight="${K.WEIGHT.bold}" letter-spacing="-10" fill="${TOMATO}">push</text>
  <text x="1010" y="520" font-family="${FONT.sans}" font-size="158" font-weight="${K.WEIGHT.bold}" letter-spacing="-8" fill="${INK}">改了哪边</text>

  ${boundaryCard({x: 930, title: '本地', accent: TEAL, rows: [
    {label: 'origin/main', fill: MUSTARD},
    {label: 'main', fill: TEAL},
  ]})}
  ${boundaryCard({x: 1430, title: '服务器', accent: TOMATO, rows: [
    {label: 'refs/heads/main', fill: TOMATO},
  ]})}
`;

K.render({outDir: 'renders/git-course/ep13-fetch-pull-push/tmp/cover-candidate', body, previews: true});
