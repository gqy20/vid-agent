#!/usr/bin/env node
// Git Course EP41–48 · 横版发布封面。
// 每张只保留一个大问题和一个关系模型；所有关系线先画，节点与卡片后画。
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
    ${K.softShadowRect({width, height, rx: 22, dx: 10, dy: 12, opacity: 0.16})}
    <rect width="${width}" height="${height}" rx="22" fill="${fill}" stroke="${accent}" stroke-width="9"/>
  </g>`;

const arrowRight = ({x1, y1, x2, y2, color = INK, width = 15, dashed = false}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 32;
  const wing = 19;
  const bx = x2 - Math.cos(angle) * head;
  const by = y2 - Math.sin(angle) * head;
  const lx = bx + Math.cos(angle + Math.PI / 2) * wing;
  const ly = by + Math.sin(angle + Math.PI / 2) * wing;
  const rx = bx + Math.cos(angle - Math.PI / 2) * wing;
  const ry = by + Math.sin(angle - Math.PI / 2) * wing;
  const dash = dashed ? ' stroke-dasharray="24 18"' : '';
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash}/><path d="M${lx} ${ly} L${x2} ${y2} L${rx} ${ry}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const folder = ({x, y, width, height, accent, label, state}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx: 24, dx: 11, dy: 14, opacity: 0.16})}
    <path d="M0 72 Q0 42 30 42 H${width * 0.37} L${width * 0.48} 0 H${width - 30} Q${width} 0 ${width} 30 V${height - 24} Q${width} ${height} ${width - 24} ${height} H24 Q0 ${height} 0 ${height - 24} Z" fill="${PAPER}" stroke="${accent}" stroke-width="10" stroke-linejoin="round"/>
    <text x="${width / 2}" y="${height * 0.49}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="46" font-weight="${K.WEIGHT.bold}" fill="${INK}">${K.esc(label)}</text>
    <text x="${width / 2}" y="${height * 0.69}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="38" font-weight="${K.WEIGHT.bold}" fill="${accent}">${K.esc(state)}</text>
  </g>`;

const covers = {
  'ep41-submodule-pointer-model': {
    body: () => `
      ${emptyBackground({ep: '41', tag: 'gitlink model'})}
      ${monoLead({text: 'gitlink', y: 445, fill: MUSTARD, size: 174})}
      ${zhLead({text: '存了什么', y: 690, size: 158})}
      ${arrowRight({x1: 1290, y1: 620, x2: 1490, y2: 620, color: INK})}
      ${panel({x: 820, y: 300, width: 470, height: 560, accent: TEAL})}
      <text x="1055" y="420" text-anchor="middle" font-family="${FONT.mono}" font-size="57" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">PARENT</text>
      ${K.refPill({x: 875, y: 535, label: '160000 · OID', width: 360, height: 118, fill: MUSTARD, stroke: INK, text: INK, fontSize: 35, strokeWidth: 8, rx: 20})}
      <text x="1055" y="790" text-anchor="middle" font-family="${FONT.sans}" font-size="32" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">tree entry</text>
      ${panel({x: 1490, y: 355, width: 360, height: 500, accent: TOMATO})}
      <text x="1670" y="465" text-anchor="middle" font-family="${FONT.mono}" font-size="57" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">CHILD</text>
      ${K.commitNode({x: 1670, y: 620, label: 'C3', radius: 105, fill: TOMATO, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 53})}
      <text x="1670" y="805" text-anchor="middle" font-family="${FONT.sans}" font-size="32" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">own history</text>`,
  },
  'ep42-cloning-and-updating-submodules': {
    body: () => `
      ${emptyBackground({ep: '42', tag: 'submodule clone'})}
      ${monoLead({text: 'clone', y: 445, fill: TEAL, size: 202})}
      ${zhLead({text: '为什么空', y: 690, size: 151})}
      ${arrowRight({x1: 1245, y1: 600, x2: 1480, y2: 600, color: TEAL})}
      ${folder({x: 820, y: 345, width: 425, height: 500, accent: INK, label: 'libs/core', state: 'EMPTY'})}
      ${K.commitNode({x: 1645, y: 600, label: 'C3', radius: 135, fill: MUSTARD, stroke: INK, strokeWidth: 11, fontSize: 61})}
      ${K.refPill({x: 1475, y: 790, label: 'DETACHED', width: 340, height: 104, fill: PAPER, stroke: TOMATO, text: TOMATO, fontSize: 44, strokeWidth: 8, rx: 20})}`,
  },
  'ep43-collaborating-with-submodules': {
    body: () => `
      ${emptyBackground({ep: '43', tag: 'publish order'})}
      ${monoLead({text: 'push', y: 445, fill: TOMATO, size: 226})}
      ${zhLead({text: '谁先走', y: 690, size: 165})}
      ${arrowRight({x1: 1260, y1: 590, x2: 1450, y2: 590, color: INK})}
      ${panel({x: 805, y: 350, width: 455, height: 490, accent: TEAL})}
      <text x="1032" y="465" text-anchor="middle" font-family="${FONT.mono}" font-size="62" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">CHILD</text>
      ${K.commitNode({x: 1032, y: 610, label: 'C3', radius: 91, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 9, fontSize: 48})}
      <text x="1032" y="795" text-anchor="middle" font-family="${FONT.sans}" font-size="36" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">C3 可获取</text>
      ${panel({x: 1450, y: 350, width: 400, height: 490, accent: TOMATO})}
      <text x="1650" y="465" text-anchor="middle" font-family="${FONT.mono}" font-size="57" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">PARENT</text>
      ${K.refPill({x: 1500, y: 545, label: 'OID → C3', width: 300, height: 118, fill: MUSTARD, stroke: INK, text: INK, fontSize: 35, strokeWidth: 8, rx: 20})}
      <text x="1650" y="795" text-anchor="middle" font-family="${FONT.sans}" font-size="36" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">gitlink</text>`,
  },
  'ep44-multiple-worktrees': {
    body: () => `
      ${emptyBackground({ep: '44', tag: 'worktree'})}
      ${monoLead({text: 'worktree', y: 425, fill: MUSTARD, size: 152})}
      ${zhLead({text: '两个现场', y: 680, size: 153})}
      <path d="M1400 660 L1045 760 M1400 660 L1660 760" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      ${panel({x: 1190, y: 290, width: 420, height: 370, accent: INK})}
      <text x="1400" y="385" text-anchor="middle" font-family="${FONT.mono}" font-size="48" font-weight="${K.WEIGHT.bold}" fill="${INK}">REPOSITORY</text>
      ${K.commitNode({x: 1400, y: 500, label: 'C2', radius: 72, fill: MUSTARD, stroke: INK, strokeWidth: 9, fontSize: 40})}
      <text x="1400" y="620" text-anchor="middle" font-family="${FONT.sans}" font-size="31" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">shared objects</text>
      ${card({x: 805, y: 725, width: 470, height: 220, label: 'main', detail: 'worktree A', accent: TEAL, labelSize: 58, detailSize: 32})}
      ${card({x: 1515, y: 725, width: 345, height: 220, label: 'hotfix', detail: 'worktree B', accent: TOMATO, labelSize: 47, detailSize: 31})}`,
  },
  'ep45-git-bundle': {
    body: () => `
      ${emptyBackground({ep: '45', tag: 'offline transfer'})}
      ${monoLead({text: 'bundle', y: 445, fill: MUSTARD, size: 178})}
      ${zhLead({text: '没有网络', y: 690, size: 154})}
      ${arrowRight({x1: 1460, y1: 610, x2: 1585, y2: 610, color: TEAL})}
      <g transform="translate(865 265)">
        ${K.softShadowRect({width: 595, height: 650, rx: 26, dx: 12, dy: 15, opacity: 0.17})}
        <path d="M0 26 Q0 0 26 0 H410 L595 185 V624 Q595 650 569 650 H26 Q0 650 0 624 Z" fill="${PAPER}" stroke="${MUSTARD}" stroke-width="11"/>
        <path d="M410 0 V185 H595" fill="none" stroke="${MUSTARD}" stroke-width="11"/>
        <path d="M112 405 H486" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
        ${K.commitNode({x: 112, y: 405, label: 'C1', radius: 69, fill: PAPER, stroke: INK, strokeWidth: 8, fontSize: 36})}
        ${K.commitNode({x: 299, y: 405, label: 'C2', radius: 69, fill: PAPER, stroke: INK, strokeWidth: 8, fontSize: 36})}
        ${K.commitNode({x: 486, y: 405, label: 'C3', radius: 75, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 8, fontSize: 38})}
        <text x="298" y="570" text-anchor="middle" font-family="${FONT.mono}" font-size="58" font-weight="${K.WEIGHT.bold}" fill="${INK}">repo.bundle</text>
      </g>
      ${card({x: 1585, y: 460, width: 285, height: 300, label: 'REPO', detail: 'verify', accent: TEAL, labelSize: 58, detailSize: 31})}`,
  },
  'ep46-sparse-partial-and-shallow-clones': {
    body: () => `
      ${emptyBackground({ep: '46', tag: 'clone boundaries'})}
      ${monoLead({text: 'clone', y: 445, fill: TEAL, size: 202})}
      ${zhLead({text: '到底少什么', y: 690, size: 133})}
      ${card({x: 805, y: 335, width: 310, height: 500, label: 'Sparse', accent: TEAL, labelSize: 47})}
      ${card({x: 1175, y: 335, width: 310, height: 500, label: 'Partial', accent: MUSTARD, labelSize: 46})}
      ${card({x: 1545, y: 335, width: 310, height: 500, label: 'Shallow', accent: TOMATO, labelSize: 43})}
      <path d="M875 675 H1045 M1245 675 H1415 M1615 675 H1785" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-opacity="0.18"/>
      <text x="960" y="775" text-anchor="middle" font-family="${FONT.sans}" font-size="74" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">路径</text>
      <text x="1330" y="775" text-anchor="middle" font-family="${FONT.sans}" font-size="74" font-weight="${K.WEIGHT.bold}" fill="${MUSTARD}">对象</text>
      <text x="1700" y="775" text-anchor="middle" font-family="${FONT.sans}" font-size="74" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">历史</text>`,
  },
  'ep47-clean-and-destructive-boundaries': {
    body: () => `
      ${emptyBackground({ep: '47', tag: 'clean scope'})}
      ${monoLead({text: 'clean', y: 445, fill: TOMATO, size: 202})}
      ${zhLead({text: '到底删谁', y: 690, size: 151})}
      <path d="M1160 395 L1430 545 M1160 595 H1430 M1160 795 L1310 710" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M1290 675 L1334 719 M1334 675 L1290 719" fill="none" stroke="${TOMATO}" stroke-width="15" stroke-linecap="round"/>
      ${card({x: 805, y: 305, width: 355, height: 180, label: 'untracked', accent: TEAL, labelSize: 40})}
      ${card({x: 805, y: 505, width: 355, height: 180, label: 'ignored', accent: MUSTARD, labelSize: 44})}
      ${card({x: 805, y: 705, width: 355, height: 180, label: 'nested repo', accent: TOMATO, labelSize: 36})}
      ${card({x: 1430, y: 405, width: 420, height: 390, label: 'build/', detail: 'dry-run → clean', accent: INK, labelSize: 80, detailSize: 35})}`,
  },
  'ep48-maintenance-and-data-recovery': {
    body: () => `
      ${emptyBackground({ep: '48', tag: 'recovery window'})}
      ${monoLead({text: 'Commit', y: 445, fill: TOMATO, size: 174})}
      ${zhLead({text: '何时消失', y: 690, size: 151})}
      <path d="M1070 445 L1280 570 M1070 790 L1280 620" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      ${arrowRight({x1: 1480, y1: 595, x2: 1610, y2: 595, color: TOMATO, width: 14, dashed: true})}
      ${K.refPill({x: 805, y: 360, label: 'ref', width: 265, height: 116, fill: TEAL, stroke: INK, text: PAPER, fontSize: 48, strokeWidth: 8, rx: 20})}
      ${K.refPill({x: 805, y: 725, label: 'reflog', width: 265, height: 116, fill: MUSTARD, stroke: INK, text: INK, fontSize: 41, strokeWidth: 8, rx: 20})}
      ${K.commitNode({x: 1370, y: 595, label: 'C2', radius: 112, fill: PAPER, stroke: INK, strokeWidth: 11, fontSize: 57, halo: MUSTARD})}
      ${card({x: 1610, y: 425, width: 260, height: 340, label: 'PRUNE', detail: 'gone', accent: TOMATO, labelSize: 49, detailSize: 36, fill: PAPER})}`,
  },
};

const requested = process.argv.slice(2);
const ids = requested.length > 0 ? requested : Object.keys(covers);

for (const id of ids) {
  const cover = covers[id];
  if (!cover) throw new Error(`Unknown cover episode: ${id}`);
  K.render({outDir: `renders/git-course/${id}/tmp/cover-candidate`, body: cover.body(), previews: true});
}
