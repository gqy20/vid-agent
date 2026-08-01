#!/usr/bin/env node
// Git Course EP33–40 · 横版发布封面。
// 每张封面只保留一个判断和一个主模型；所有连线先画、节点与卡片后画。
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

const zhLead = ({text, y, fill = INK, size = 148, x = 66, spacing = -7}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.sans}" font-size="${size}" font-weight="${K.WEIGHT.bold}" letter-spacing="${spacing}" fill="${fill}">${K.esc(text)}</text>`;

const card = ({x, y, width, height, label, detail, accent = INK, labelSize = 42, detailSize = 27, labelFamily = FONT.mono}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx: 20, dx: 10, dy: 12, opacity: 0.16})}
    <rect width="${width}" height="${height}" rx="20" fill="${PAPER}" stroke="${accent}" stroke-width="8"/>
    <text x="${width / 2}" y="${detail ? height * 0.43 : height * 0.54}" text-anchor="middle" dominant-baseline="central" font-family="${labelFamily}" font-size="${labelSize}" font-weight="${K.WEIGHT.bold}" fill="${accent}">${K.esc(label)}</text>
    ${detail ? `<text x="${width / 2}" y="${height * 0.72}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="${detailSize}" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">${K.esc(detail)}</text>` : ''}
  </g>`;

const arrowRight = ({x1, y1, x2, y2, color = INK, width = 14}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 30;
  const wing = 18;
  const bx = x2 - Math.cos(angle) * head;
  const by = y2 - Math.sin(angle) * head;
  const lx = bx + Math.cos(angle + Math.PI / 2) * wing;
  const ly = by + Math.sin(angle + Math.PI / 2) * wing;
  const rx = bx + Math.cos(angle - Math.PI / 2) * wing;
  const ry = by + Math.sin(angle - Math.PI / 2) * wing;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><path d="M${lx} ${ly} L${x2} ${y2} L${rx} ${ry}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const covers = {
  'ep33-configuration-scopes': {
    ep: '33',
    tag: 'config scope',
    body: () => `
      ${emptyBackground({ep: '33', tag: 'config scope'})}
      ${monoLead({text: 'config', y: 430, fill: MUSTARD, size: 190})}
      ${zhLead({text: '谁生效', y: 670, size: 158})}
      <g fill="none">
        ${arrowRight({x1: 1270, y1: 370, x2: 1460, y2: 500, color: INK, width: 12})}
        ${arrowRight({x1: 1270, y1: 570, x2: 1460, y2: 570, color: INK, width: 12})}
        ${arrowRight({x1: 1270, y1: 770, x2: 1460, y2: 640, color: TEAL, width: 14})}
      </g>
      ${card({x: 900, y: 300, width: 370, height: 140, label: 'system', accent: INK, labelSize: 39})}
      ${card({x: 900, y: 500, width: 370, height: 140, label: 'global', accent: TOMATO, labelSize: 39})}
      ${card({x: 900, y: 700, width: 370, height: 140, label: 'local', accent: TEAL, labelSize: 39})}
      ${card({x: 1460, y: 450, width: 380, height: 240, label: 'local', detail: 'demo.label', accent: TEAL, labelSize: 72, detailSize: 31})}`,
  },
  'ep34-ignore-rules-and-excludes': {
    ep: '34',
    tag: 'ignore rules',
    body: () => `
      ${emptyBackground({ep: '34', tag: 'ignore rules'})}
      ${monoLead({text: 'ignore', y: 420, fill: TEAL, size: 188})}
      ${zhLead({text: '谁藏了它', y: 665, size: 148})}
      <path d="M1060 472 L1325 650 M1390 472 L1460 650 M1720 472 L1595 650" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      ${card({x: 880, y: 320, width: 300, height: 152, label: '.gitignore', accent: TEAL, labelSize: 38})}
      ${card({x: 1240, y: 320, width: 300, height: 152, label: 'exclude', accent: MUSTARD, labelSize: 44})}
      ${card({x: 1600, y: 320, width: 260, height: 152, label: 'global', accent: TOMATO, labelSize: 42})}
      ${card({x: 1190, y: 650, width: 560, height: 245, label: 'build/', detail: 'ignored', accent: INK, labelSize: 82, detailSize: 34})}`,
  },
  'ep35-attributes-text-and-binary': {
    ep: '35',
    tag: 'text · binary',
    body: () => `
      ${emptyBackground({ep: '35', tag: 'text · binary'})}
      ${monoLead({text: 'LF', y: 430, fill: TEAL, size: 240, spacing: -14})}
      ${monoLead({text: 'CRLF', y: 720, fill: TOMATO, size: 186, spacing: -13})}
      ${arrowRight({x1: 620, y1: 360, x2: 935, y2: 480, color: TEAL, width: 14})}
      ${arrowRight({x1: 690, y1: 650, x2: 935, y2: 560, color: TOMATO, width: 14})}
      ${card({x: 935, y: 350, width: 460, height: 360, label: 'Index', detail: 'normalized LF', accent: MUSTARD, labelSize: 82, detailSize: 34})}
      <path d="M1460 310 V790" stroke="${INK}" stroke-width="8" stroke-dasharray="18 18" stroke-opacity="0.24"/>
      <g transform="translate(1535 400) rotate(-7 150 130)">
        ${K.softShadowRect({width: 300, height: 260, rx: 130, dx: 11, dy: 14, opacity: 0.16})}
        <rect width="300" height="260" rx="130" fill="${PAPER}" stroke="${TOMATO}" stroke-width="11"/>
        <text x="150" y="112" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="54" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">Binary</text>
        <text x="150" y="178" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="40" font-weight="${K.WEIGHT.bold}" fill="${INK}">-diff</text>
      </g>`,
  },
  'ep36-custom-diff-merge-and-filters': {
    ep: '36',
    tag: 'custom drivers',
    body: () => `
      ${emptyBackground({ep: '36', tag: 'custom drivers'})}
      ${monoLead({text: 'driver', y: 420, fill: MUSTARD, size: 184})}
      ${zhLead({text: '改哪一层', y: 665, size: 148})}
      <path d="M1115 570 L1310 350 M1115 570 H1310 M1115 570 L1310 790" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
      <g transform="translate(865 430)">
        ${K.softShadowRect({width: 250, height: 280, rx: 20, dx: 11, dy: 13, opacity: 0.16})}
        <path d="M0 20 Q0 0 20 0 H165 L250 85 V260 Q250 280 230 280 H20 Q0 280 0 260 Z" fill="${PAPER}" stroke="${TEAL}" stroke-width="9"/>
        <path d="M165 0 V85 H250" fill="none" stroke="${TEAL}" stroke-width="9"/>
        <text x="125" y="188" text-anchor="middle" font-family="${FONT.mono}" font-size="45" font-weight="${K.WEIGHT.bold}" fill="${INK}">data</text>
      </g>
      ${card({x: 1310, y: 255, width: 500, height: 190, label: 'Diff', detail: 'view', accent: TEAL, labelSize: 62, detailSize: 30})}
      ${card({x: 1310, y: 475, width: 500, height: 190, label: 'Merge', detail: 'write result', accent: TOMATO, labelSize: 62, detailSize: 30})}
      ${card({x: 1310, y: 695, width: 500, height: 190, label: 'Filter', detail: 'transform', accent: MUSTARD, labelSize: 62, detailSize: 30})}`,
  },
  'ep37-client-hooks': {
    ep: '37',
    tag: 'client hooks',
    body: () => `
      ${emptyBackground({ep: '37', tag: 'client hooks'})}
      ${monoLead({text: 'Hook', y: 455, fill: TOMATO, size: 226})}
      ${zhLead({text: '何时运行', y: 700, size: 150})}
      <path d="M875 625 H1770" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
      ${K.refPill({x: 790, y: 570, label: 'Index', width: 240, height: 110, fill: PAPER, stroke: TEAL, text: INK, fontSize: 44, strokeWidth: 9, rx: 20})}
      <g transform="translate(1080 305)">
        ${K.softShadowRect({width: 210, height: 640, rx: 26, dx: 11, dy: 13, opacity: 0.16})}
        <rect width="210" height="640" rx="26" fill="${TOMATO}" stroke="${INK}" stroke-width="9"/>
        <text x="105" y="292" text-anchor="middle" font-family="${FONT.mono}" font-size="45" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">PRE</text>
        <text x="105" y="356" text-anchor="middle" font-family="${FONT.sans}" font-size="30" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">裁决</text>
      </g>
      ${K.commitNode({x: 1440, y: 625, label: 'C1', radius: 102, fill: MUSTARD, stroke: INK, strokeWidth: 9, fontSize: 50})}
      ${card({x: 1600, y: 505, width: 270, height: 240, label: 'POST', detail: 'log', accent: TEAL, labelSize: 52, detailSize: 32})}`,
  },
  'ep38-server-hooks-and-policy': {
    ep: '38',
    tag: 'server policy',
    body: () => `
      ${emptyBackground({ep: '38', tag: 'server policy'})}
      ${monoLead({text: 'server', y: 420, fill: TOMATO, size: 178})}
      ${zhLead({text: '谁说了算', y: 665, size: 148})}
      ${arrowRight({x1: 1035, y1: 440, x2: 1370, y2: 500, color: TEAL, width: 14})}
      ${arrowRight({x1: 1035, y1: 740, x2: 1370, y2: 680, color: TOMATO, width: 14})}
      ${card({x: 830, y: 350, width: 310, height: 180, label: 'main', detail: 'update', accent: TEAL, labelSize: 54})}
      ${card({x: 830, y: 650, width: 310, height: 180, label: 'topic', detail: 'update', accent: TOMATO, labelSize: 52})}
      <g transform="translate(1370 270)">
        ${K.softShadowRect({width: 460, height: 650, rx: 28, dx: 12, dy: 15, opacity: 0.18})}
        <rect width="460" height="650" rx="28" fill="${INK}" stroke="${TOMATO}" stroke-width="11"/>
        <text x="230" y="210" text-anchor="middle" font-family="${FONT.mono}" font-size="52" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">SERVER</text>
        <path d="M90 285 H370" stroke="${PAPER}" stroke-width="9" stroke-opacity="0.32"/>
        <text x="230" y="420" text-anchor="middle" font-family="${FONT.mono}" font-size="74" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">REJECT</text>
        <text x="230" y="505" text-anchor="middle" font-family="${FONT.sans}" font-size="34" font-weight="${K.WEIGHT.bold}" fill="${PAPER}">整批停止</text>
      </g>`,
  },
  'ep39-signing-commits-and-tags': {
    ep: '39',
    tag: 'object signing',
    body: () => `
      ${emptyBackground({ep: '39', tag: 'object signing'})}
      ${zhLead({text: '签名', y: 445, fill: TOMATO, size: 226, spacing: -12})}
      ${zhLead({text: '证明什么', y: 690, size: 150})}
      <path d="M1100 400 L1325 540 M1100 740 L1325 600" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M1515 570 H1635" fill="none" stroke="${TOMATO}" stroke-width="11" stroke-dasharray="20 16" stroke-linecap="round"/>
      ${card({x: 820, y: 310, width: 330, height: 180, label: 'Commit', accent: TEAL, labelSize: 50})}
      ${card({x: 820, y: 650, width: 330, height: 180, label: 'Tag', accent: MUSTARD, labelSize: 56})}
      <g transform="translate(1265 420)">
        <circle cx="130" cy="150" r="130" fill="${PAPER}" stroke="${TOMATO}" stroke-width="11"/>
        <circle cx="130" cy="150" r="94" fill="none" stroke="${TOMATO}" stroke-width="6" stroke-dasharray="14 11"/>
        <text x="130" y="138" text-anchor="middle" dominant-baseline="central" font-family="${FONT.mono}" font-size="58" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">SIG</text>
        <text x="130" y="202" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="29" font-weight="${K.WEIGHT.bold}" fill="${INK}">对象关系</text>
      </g>
      ${card({x: 1635, y: 430, width: 250, height: 280, label: 'Trust', detail: 'map', accent: INK, labelSize: 49, detailSize: 31})}`,
  },
  'ep40-credentials-and-trust-boundaries': {
    ep: '40',
    tag: 'trust boundaries',
    body: () => `
      ${emptyBackground({ep: '40', tag: 'trust boundaries'})}
      ${zhLead({text: '名字', y: 430, fill: TEAL, size: 218, spacing: -12})}
      ${zhLead({text: '≠ 权限', y: 710, fill: TOMATO, size: 188, spacing: -11})}
      <path d="M830 315 V845 M1165 315 V845 M1500 315 V845 M1835 315 V845" fill="none" stroke="${INK}" stroke-width="5" stroke-opacity="0.18"/>
      ${card({x: 850, y: 360, width: 290, height: 420, label: '作者', detail: '元数据', accent: TEAL, labelSize: 66, detailSize: 35, labelFamily: FONT.sans})}
      ${card({x: 1185, y: 360, width: 290, height: 420, label: '凭证', detail: '连接', accent: MUSTARD, labelSize: 66, detailSize: 35, labelFamily: FONT.sans})}
      ${card({x: 1520, y: 360, width: 290, height: 420, label: '权限', detail: '服务器', accent: TOMATO, labelSize: 66, detailSize: 35, labelFamily: FONT.sans})}`,
  },
};

const requested = process.argv.slice(2);
const ids = requested.length > 0 ? requested : Object.keys(covers);

for (const id of ids) {
  const cover = covers[id];
  if (!cover) throw new Error(`Unknown cover episode: ${id}`);
  K.render({outDir: `renders/git-course/${id}/tmp/cover-candidate`, body: cover.body(), previews: true});
}
