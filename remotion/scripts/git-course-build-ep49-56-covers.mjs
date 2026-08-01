#!/usr/bin/env node
// Git Course EP49–56 · 横版发布封面。
// 延续 EP41–48 的编辑式构图：左侧大判断，右侧只保留一个关系模型。
// 所有关系线先画，卡片与节点后画，避免线条覆盖边框。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const emptyBackground = ({ep, tag}) => `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep, tag})}`;

const monoLead = ({text, y, fill, size = 200, x = 66, spacing = -10}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.mono}" font-size="${size}" font-weight="${K.WEIGHT.bold}" letter-spacing="${spacing}" fill="${fill}">${K.esc(text)}</text>`;

const zhLead = ({text, y, fill = INK, size = 150, x = 66, spacing = -7}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.sans}" font-size="${size}" font-weight="${K.WEIGHT.bold}" letter-spacing="${spacing}" fill="${fill}">${K.esc(text)}</text>`;

const card = ({x, y, width, height, label, detail, accent = INK, labelSize = 48, detailSize = 30, labelFamily = FONT.mono, fill = PAPER}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx: 22, dx: 10, dy: 12, opacity: 0.16})}
    <rect width="${width}" height="${height}" rx="22" fill="${fill}" stroke="${accent}" stroke-width="9"/>
    <text x="${width / 2}" y="${detail ? height * 0.43 : height * 0.53}" text-anchor="middle" dominant-baseline="central" font-family="${labelFamily}" font-size="${labelSize}" font-weight="${K.WEIGHT.bold}" fill="${accent}">${K.esc(label)}</text>
    ${detail ? `<text x="${width / 2}" y="${height * 0.72}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="${detailSize}" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">${K.esc(detail)}</text>` : ''}
  </g>`;

const panel = ({x, y, width, height, accent = INK, fill = PAPER}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx: 24, dx: 11, dy: 14, opacity: 0.17})}
    <rect width="${width}" height="${height}" rx="24" fill="${fill}" stroke="${accent}" stroke-width="10"/>
  </g>`;

const arrow = ({x1, y1, x2, y2, color = INK, width = 14}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 31;
  const wing = 18;
  const bx = x2 - Math.cos(angle) * head;
  const by = y2 - Math.sin(angle) * head;
  const lx = bx + Math.cos(angle + Math.PI / 2) * wing;
  const ly = by + Math.sin(angle + Math.PI / 2) * wing;
  const rx = bx + Math.cos(angle - Math.PI / 2) * wing;
  const ry = by + Math.sin(angle - Math.PI / 2) * wing;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><path d="M${lx} ${ly} L${x2} ${y2} L${rx} ${ry}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const nodeCaption = ({x, y, text, size = 29, fill = INK}) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT.mono}" font-size="${size}" font-weight="${K.WEIGHT.bold}" fill="${fill}">${K.esc(text)}</text>`;

const covers = {
  'ep49-plumbing-and-porcelain': {
    body: () => `
      ${emptyBackground({ep: '49', tag: 'command layers'})}
      ${zhLead({text: '两层命令', y: 430, fill: TEAL, size: 158})}
      ${zhLead({text: '同一状态', y: 695, fill: TOMATO, size: 158})}
      <path d="M1180 375 L1390 560 M1180 755 L1390 560 M1390 560 H1810" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      ${card({x: 810, y: 285, width: 370, height: 180, label: 'PORCELAIN', detail: 'task command', accent: TEAL, labelSize: 39})}
      ${card({x: 810, y: 665, width: 370, height: 180, label: 'PLUMBING', detail: 'model query', accent: TOMATO, labelSize: 39})}
      ${K.commitNode({x: 1390, y: 560, label: 'ref', radius: 68, fill: PAPER, stroke: TEAL, strokeWidth: 9, fontSize: 28})}
      ${K.commitNode({x: 1530, y: 560, label: 'C', radius: 68, fill: MUSTARD, stroke: INK, strokeWidth: 9, fontSize: 39})}
      ${K.commitNode({x: 1670, y: 560, label: 'T', radius: 68, fill: PAPER, stroke: TOMATO, strokeWidth: 9, fontSize: 39})}
      ${K.commitNode({x: 1810, y: 560, label: 'B', radius: 68, fill: PAPER, stroke: TEAL, strokeWidth: 9, fontSize: 39})}
      ${nodeCaption({x: 1390, y: 685, text: 'ref'})}
      ${nodeCaption({x: 1530, y: 685, text: 'commit'})}
      ${nodeCaption({x: 1670, y: 685, text: 'tree'})}
      ${nodeCaption({x: 1810, y: 685, text: 'blob'})}`,
  },
  'ep50-blob-object-database': {
    body: () => `
      ${emptyBackground({ep: '50', tag: 'blob identity'})}
      ${monoLead({text: 'Blob', y: 455, fill: TEAL, size: 226})}
      ${zhLead({text: '不存文件名', y: 705, size: 142})}
      <path d="M1180 355 L1455 445 M1180 575 L1455 445 M1180 795 L1645 755" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      ${card({x: 820, y: 285, width: 360, height: 140, label: 'app.js', accent: TEAL, labelSize: 48})}
      ${card({x: 820, y: 505, width: 360, height: 140, label: 'copy.js', accent: TEAL, labelSize: 48})}
      ${card({x: 820, y: 725, width: 360, height: 140, label: '+ 1 byte', accent: TOMATO, labelSize: 44})}
      ${K.commitNode({x: 1455, y: 445, label: 'OID', radius: 118, fill: MUSTARD, stroke: INK, strokeWidth: 11, fontSize: 50})}
      ${nodeCaption({x: 1455, y: 620, text: 'same bytes', size: 34, fill: TEAL})}
      ${K.commitNode({x: 1645, y: 755, label: 'NEW', radius: 112, fill: TOMATO, stroke: INK, text: PAPER, strokeWidth: 11, fontSize: 45})}
      ${nodeCaption({x: 1645, y: 925, text: 'new OID', size: 34, fill: TOMATO})}`,
  },
  'ep51-trees-and-snapshots': {
    body: () => `
      ${emptyBackground({ep: '51', tag: 'tree snapshot'})}
      ${monoLead({text: 'Tree', y: 455, fill: MUSTARD, size: 226})}
      ${zhLead({text: '拼出快照', y: 705, size: 154})}
      <path d="M1000 560 L1370 380 M1000 560 L1370 760 M1370 380 H1730" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      ${K.commitNode({x: 1000, y: 560, label: 'ROOT', radius: 112, fill: MUSTARD, stroke: INK, strokeWidth: 11, fontSize: 42})}
      ${K.commitNode({x: 1370, y: 380, label: 'TREE', radius: 98, fill: PAPER, stroke: TEAL, strokeWidth: 10, fontSize: 38})}
      ${K.commitNode({x: 1370, y: 760, label: 'BLOB', radius: 98, fill: PAPER, stroke: TOMATO, strokeWidth: 10, fontSize: 37})}
      ${K.commitNode({x: 1730, y: 380, label: 'BLOB', radius: 98, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 37})}
      ${nodeCaption({x: 1000, y: 725, text: 'root tree', size: 33})}
      ${nodeCaption({x: 1370, y: 535, text: 'src/', size: 33})}
      ${nodeCaption({x: 1370, y: 915, text: 'README', size: 31})}
      ${nodeCaption({x: 1730, y: 535, text: 'app.js', size: 33})}`,
  },
  'ep52-commit-and-tag-objects': {
    body: () => `
      ${emptyBackground({ep: '52', tag: 'object edges'})}
      ${monoLead({text: 'Commit', y: 445, fill: TOMATO, size: 174})}
      ${zhLead({text: '不存 Diff', y: 695, size: 154})}
      ${arrow({x1: 1420, y1: 580, x2: 1190, y2: 395, color: TEAL})}
      ${arrow({x1: 1420, y1: 580, x2: 1190, y2: 775, color: INK})}
      ${arrow({x1: 1600, y1: 390, x2: 1420, y2: 580, color: TOMATO})}
      ${card({x: 840, y: 305, width: 350, height: 180, label: 'TREE', detail: 'snapshot', accent: TEAL, labelSize: 58})}
      ${card({x: 840, y: 685, width: 350, height: 180, label: 'C1', detail: 'parent', accent: INK, labelSize: 63})}
      ${card({x: 1600, y: 300, width: 270, height: 180, label: 'TAG', detail: 'target', accent: TOMATO, labelSize: 58})}
      ${K.commitNode({x: 1420, y: 580, label: 'C2', radius: 128, fill: MUSTARD, stroke: INK, strokeWidth: 12, fontSize: 60})}
      ${nodeCaption({x: 1420, y: 770, text: 'commit object', size: 36})}`,
  },
  'ep53-refs-head-and-packed-refs': {
    body: () => `
      ${emptyBackground({ep: '53', tag: 'refs and HEAD'})}
      ${monoLead({text: 'HEAD', y: 455, fill: MUSTARD, size: 210})}
      ${zhLead({text: '名字落到对象', y: 705, size: 124})}
      <path d="M1430 700 H1730 M1725 326 V430 M1725 526 L1730 700 M1325 526 L1430 700" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      ${K.refPill({x: 1580, y: 230, label: 'HEAD', width: 290, height: 96, fill: MUSTARD, stroke: INK, text: INK, fontSize: 44, strokeWidth: 8, rx: 20})}
      ${K.refPill({x: 1580, y: 430, label: 'main', width: 290, height: 96, fill: TEAL, stroke: INK, text: PAPER, fontSize: 44, strokeWidth: 8, rx: 20})}
      ${K.refPill({x: 1180, y: 430, label: 'v1.0', width: 290, height: 96, fill: PAPER, stroke: TOMATO, text: TOMATO, fontSize: 42, strokeWidth: 8, rx: 20})}
      ${K.commitNode({x: 1430, y: 700, label: 'C2', radius: 103, fill: PAPER, stroke: TOMATO, strokeWidth: 10, fontSize: 51})}
      ${K.commitNode({x: 1730, y: 700, label: 'C3', radius: 112, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 11, fontSize: 55})}`,
  },
  'ep54-refspecs': {
    body: () => `
      ${emptyBackground({ep: '54', tag: 'refspec direction'})}
      ${monoLead({text: 'src:dst', y: 455, fill: TEAL, size: 164})}
      ${zhLead({text: '方向相反', y: 705, fill: TOMATO, size: 152})}
      ${arrow({x1: 1510, y1: 500, x2: 1210, y2: 500, color: TEAL, width: 16})}
      ${arrow({x1: 1210, y1: 675, x2: 1510, y2: 675, color: TOMATO, width: 16})}
      ${panel({x: 850, y: 360, width: 360, height: 430, accent: TEAL})}
      ${panel({x: 1510, y: 360, width: 360, height: 430, accent: TOMATO})}
      <text x="1030" y="470" text-anchor="middle" font-family="${FONT.mono}" font-size="58" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">LOCAL</text>
      <text x="1690" y="470" text-anchor="middle" font-family="${FONT.mono}" font-size="54" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">REMOTE</text>
      <text x="1030" y="650" text-anchor="middle" font-family="${FONT.mono}" font-size="34" font-weight="${K.WEIGHT.bold}" fill="${INK}">refs/remotes/*</text>
      <text x="1690" y="650" text-anchor="middle" font-family="${FONT.mono}" font-size="34" font-weight="${K.WEIGHT.bold}" fill="${INK}">refs/heads/*</text>
      <text x="1360" y="462" text-anchor="middle" font-family="${FONT.mono}" font-size="42" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">fetch</text>
      <text x="1360" y="640" text-anchor="middle" font-family="${FONT.mono}" font-size="42" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">push</text>` ,
  },
  'ep55-packfiles-and-deltas': {
    body: () => `
      ${emptyBackground({ep: '55', tag: 'pack and delta'})}
      ${monoLead({text: 'Pack', y: 455, fill: MUSTARD, size: 226})}
      ${zhLead({text: '不改 OID', y: 705, size: 152})}
      <path d="M965 360 L1230 510 M965 560 H1230 M965 760 L1230 610" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      ${panel({x: 1230, y: 250, width: 620, height: 650, accent: MUSTARD})}
      <path d="M1420 610 H1690" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
      ${K.commitNode({x: 900, y: 360, label: 'O1', radius: 68, fill: PAPER, stroke: TEAL, strokeWidth: 9, fontSize: 37})}
      ${K.commitNode({x: 900, y: 560, label: 'O2', radius: 68, fill: PAPER, stroke: TOMATO, strokeWidth: 9, fontSize: 37})}
      ${K.commitNode({x: 900, y: 760, label: 'O3', radius: 68, fill: PAPER, stroke: INK, strokeWidth: 9, fontSize: 37})}
      <text x="1540" y="390" text-anchor="middle" font-family="${FONT.mono}" font-size="66" font-weight="${K.WEIGHT.bold}" fill="${INK}">PACK + IDX</text>
      ${K.commitNode({x: 1420, y: 610, label: 'BASE', radius: 95, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 36})}
      ${K.commitNode({x: 1690, y: 610, label: 'Δ', radius: 95, fill: TOMATO, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 62})}
      ${nodeCaption({x: 1420, y: 775, text: 'full object', size: 31})}
      ${nodeCaption({x: 1690, y: 775, text: 'delta', size: 34})}`,
  },
  'ep56-transfer-protocols': {
    body: () => `
      ${emptyBackground({ep: '56', tag: 'object transfer'})}
      ${zhLead({text: '两个仓库', y: 430, fill: TEAL, size: 154})}
      ${zhLead({text: '交换对象', y: 695, fill: TOMATO, size: 154})}
      ${arrow({x1: 1510, y1: 500, x2: 1210, y2: 500, color: TEAL, width: 16})}
      ${arrow({x1: 1210, y1: 690, x2: 1510, y2: 690, color: TOMATO, width: 16})}
      ${panel({x: 850, y: 360, width: 360, height: 470, accent: TEAL})}
      ${panel({x: 1510, y: 360, width: 360, height: 470, accent: TOMATO})}
      <text x="1030" y="470" text-anchor="middle" font-family="${FONT.mono}" font-size="55" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">CLIENT</text>
      <text x="1690" y="470" text-anchor="middle" font-family="${FONT.mono}" font-size="55" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">REMOTE</text>
      ${K.commitNode({x: 1030, y: 650, label: 'C2', radius: 108, fill: PAPER, stroke: TEAL, strokeWidth: 10, fontSize: 53})}
      ${K.commitNode({x: 1690, y: 650, label: 'C3', radius: 108, fill: TOMATO, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 53})}
      <text x="1360" y="458" text-anchor="middle" font-family="${FONT.mono}" font-size="39" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">REFS</text>
      <text x="1360" y="650" text-anchor="middle" font-family="${FONT.mono}" font-size="39" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">PACK</text>`,
  },
};

const requested = process.argv.slice(2);
const ids = requested.length > 0 ? requested : Object.keys(covers);

for (const id of ids) {
  const cover = covers[id];
  if (!cover) throw new Error(`Unknown cover episode: ${id}`);
  K.render({outDir: `renders/git-course/${id}/tmp/cover-candidate`, body: cover.body(), previews: true});
}
