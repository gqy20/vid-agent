#!/usr/bin/env node
// EP13 · fetch / pull / push 分别改动不同边界。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const boundaryCard = ({x, title, accent, rows}) => {
  const rowHeight = 88;
  const rowGap = 28;
  const contentTop = 108;
  const contentHeight = 238;
  const rowsHeight = rows.length * rowHeight + (rows.length - 1) * rowGap;
  const firstRowY = contentTop + (contentHeight - rowsHeight) / 2;

  return `
  <g transform="translate(${x} 475)">
    ${K.softShadowRect({width: 440, height: 390, rx: 22, dx: 11, dy: 13, opacity: 0.16})}
    <rect width="440" height="390" rx="22" fill="${PAPER}" stroke="${accent}" stroke-width="9"/>
    <text x="32" y="67" font-family="${FONT.sans}" font-size="43" font-weight="${K.WEIGHT.bold}" fill="${INK}">${title}</text>
    <path d="M32 92 H408" fill="none" stroke="${accent}" stroke-width="5" stroke-opacity="0.22"/>
    ${rows.map((row, index) => {
      const rowY = firstRowY + index * (rowHeight + rowGap);
      return `
      <rect x="32" y="${rowY}" width="376" height="${rowHeight}" rx="15" fill="${row.fill}" fill-opacity="0.15"/>
      <text x="56" y="${rowY + 58}" font-family="${FONT.mono}" font-size="32" font-weight="${K.WEIGHT.bold}" fill="${row.fill}">${row.label}</text>`;
    }).join('')}
  </g>`;
};

const body = `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep: '13', tag: 'remote flow'})}

  <text x="66" y="385" font-family="${FONT.mono}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${MUSTARD}">fetch</text>
  <text x="66" y="575" font-family="${FONT.mono}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${TEAL}">pull</text>
  <text x="66" y="765" font-family="${FONT.mono}" font-size="164" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${TOMATO}">push</text>
  <text x="1340" y="365" text-anchor="middle" font-family="${FONT.sans}" font-size="140" font-weight="${K.WEIGHT.bold}" letter-spacing="-7" fill="${INK}">改了哪边</text>

  ${boundaryCard({x: 810, title: '本地', accent: TEAL, rows: [
    {label: 'origin/main', fill: MUSTARD},
    {label: 'main', fill: TEAL},
  ]})}
  <g fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1285 620 H1395 M1374 598 L1396 620 L1374 642"/>
    <path d="M1395 720 H1285 M1306 698 L1284 720 L1306 742"/>
  </g>
  ${boundaryCard({x: 1430, title: '服务器', accent: TOMATO, rows: [
    {label: 'refs/heads/main', fill: TOMATO},
  ]})}
`;

K.render({outDir: 'renders/git-course/ep13-fetch-pull-push/tmp/cover-candidate', body, previews: true});
