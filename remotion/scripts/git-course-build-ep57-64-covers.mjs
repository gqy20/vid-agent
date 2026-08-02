#!/usr/bin/env node
// Git Course EP57–64 · 横版发布封面。
// 延续对象篇封面的编辑式构图：左侧大判断，右侧只保留一个关系模型。
// 所有关系线先画，卡片与节点后画，避免线条覆盖边框。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const emptyBackground = ({ep, tag}) => `
  ${K.bg({
    c1: {cx: 0, cy: 0, r: 0, fill: TEAL},
    c2: {cx: 0, cy: 0, r: 0, fill: TOMATO},
  })}
  ${K.badge({ep, tag})}`;

const monoLead = ({text, y, fill, size = 190, x = 66, spacing = -9}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.mono}" font-size="${size}" font-weight="${K.WEIGHT.bold}" letter-spacing="${spacing}" fill="${fill}">${K.esc(text)}</text>`;

const zhLead = ({text, y, fill = INK, size = 150, x = 66, spacing = -7}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.sans}" font-size="${size}" font-weight="${K.WEIGHT.bold}" letter-spacing="${spacing}" fill="${fill}">${K.esc(text)}</text>`;

const card = ({x, y, width, height, label, detail, accent = INK, labelSize = 48, detailSize = 30, labelFamily = FONT.mono, fill = PAPER}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx: 22, dx: 10, dy: 12, opacity: 0.16})}
    <rect width="${width}" height="${height}" rx="22" fill="${fill}" stroke="${accent}" stroke-width="9"/>
    <text x="${width / 2}" y="${detail ? height * 0.42 : height * 0.52}" text-anchor="middle" dominant-baseline="central" font-family="${labelFamily}" font-size="${labelSize}" font-weight="${K.WEIGHT.bold}" fill="${accent}">${K.esc(label)}</text>
    ${detail ? `<text x="${width / 2}" y="${height * 0.72}" text-anchor="middle" dominant-baseline="central" font-family="${FONT.sans}" font-size="${detailSize}" font-weight="${K.WEIGHT.bold}" fill="${INK}" fill-opacity="0.72">${K.esc(detail)}</text>` : ''}
  </g>`;

const panel = ({x, y, width, height, accent = INK, fill = PAPER, rx = 24}) => `
  <g transform="translate(${x} ${y})">
    ${K.softShadowRect({width, height, rx, dx: 11, dy: 14, opacity: 0.17})}
    <rect width="${width}" height="${height}" rx="${rx}" fill="${fill}" stroke="${accent}" stroke-width="10"/>
  </g>`;

const arrow = ({x1, y1, x2, y2, color = INK, width = 15}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 32;
  const wing = 19;
  const bx = x2 - Math.cos(angle) * head;
  const by = y2 - Math.sin(angle) * head;
  const lx = bx + Math.cos(angle + Math.PI / 2) * wing;
  const ly = by + Math.sin(angle + Math.PI / 2) * wing;
  const rx = bx + Math.cos(angle - Math.PI / 2) * wing;
  const ry = by + Math.sin(angle - Math.PI / 2) * wing;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/><path d="M${lx} ${ly} L${x2} ${y2} L${rx} ${ry}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const caption = ({x, y, text, size = 31, fill = INK, anchor = 'middle', family = FONT.mono}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${K.WEIGHT.bold}" fill="${fill}">${K.esc(text)}</text>`;

const covers = {
  'ep57-git-protocols-and-access': {
    body: () => `
      ${emptyBackground({ep: '57', tag: 'transports'})}
      ${zhLead({text: '四种连接', y: 430, fill: TEAL, size: 156})}
      ${zhLead({text: '同一仓库', y: 695, fill: TOMATO, size: 156})}
      <path d="M1140 300 L1570 555 M1140 470 L1570 555 M1140 640 L1570 555 M1140 810 L1570 555" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      ${card({x: 825, y: 238, width: 315, height: 124, label: 'LOCAL', accent: MUSTARD, labelSize: 45})}
      ${card({x: 825, y: 408, width: 315, height: 124, label: 'SSH', accent: TEAL, labelSize: 52})}
      ${card({x: 825, y: 578, width: 315, height: 124, label: 'HTTP', accent: TOMATO, labelSize: 50})}
      ${card({x: 825, y: 748, width: 315, height: 124, label: 'git://', accent: INK, labelSize: 47})}
      ${K.commitNode({x: 1570, y: 555, label: 'REPO', radius: 160, fill: PAPER, stroke: INK, strokeWidth: 13, fontSize: 55})}
      ${caption({x: 1570, y: 785, text: 'same objects', size: 36, fill: TEAL})}`,
  },
  'ep58-bare-repositories-and-receive-pack': {
    body: () => `
      ${emptyBackground({ep: '58', tag: 'bare repository'})}
      ${monoLead({text: 'Push', y: 455, fill: MUSTARD, size: 224})}
      ${zhLead({text: '写进 Bare', y: 705, fill: TOMATO, size: 144})}
      ${arrow({x1: 1090, y1: 570, x2: 1390, y2: 570, color: TOMATO, width: 17})}
      ${K.commitNode({x: 980, y: 570, label: 'C3', radius: 116, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 11, fontSize: 55})}
      ${panel({x: 1390, y: 300, width: 470, height: 540, accent: TOMATO})}
      <text x="1625" y="410" text-anchor="middle" font-family="${FONT.mono}" font-size="58" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">BARE REPO</text>
      ${K.refPill({x: 1475, y: 475, label: 'main', width: 300, height: 100, fill: TEAL, stroke: INK, text: PAPER, fontSize: 43, strokeWidth: 8, rx: 20})}
      <path d="M1625 575 V665" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      ${K.commitNode({x: 1625, y: 715, label: 'C3', radius: 92, fill: MUSTARD, stroke: INK, strokeWidth: 10, fontSize: 47})}
      `,
  },
  'ep59-ssh-keys-and-server-access': {
    body: () => `
      ${emptyBackground({ep: '59', tag: 'ssh access'})}
      ${monoLead({text: 'SSH Key', y: 445, fill: TEAL, size: 158})}
      ${zhLead({text: '不等于写权限', y: 700, fill: TOMATO, size: 120})}
      ${arrow({x1: 1020, y1: 555, x2: 1190, y2: 555, color: TEAL})}
      ${arrow({x1: 1370, y1: 555, x2: 1510, y2: 555, color: INK})}
      ${arrow({x1: 1690, y1: 555, x2: 1760, y2: 555, color: TOMATO})}
      ${card({x: 790, y: 475, width: 230, height: 160, label: 'KEY', accent: TEAL, labelSize: 54})}
      ${K.commitNode({x: 1280, y: 555, label: 'HOST', radius: 94, fill: PAPER, stroke: TEAL, strokeWidth: 10, fontSize: 39})}
      ${K.commitNode({x: 1600, y: 555, label: 'USER', radius: 94, fill: PAPER, stroke: INK, strokeWidth: 10, fontSize: 39})}
      ${K.commitNode({x: 1770, y: 555, label: 'REPO', radius: 94, fill: TOMATO, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 39})}
      ${caption({x: 1280, y: 730, text: '服务器', size: 35, fill: TEAL, family: FONT.sans})}
      ${caption({x: 1600, y: 730, text: '身份', size: 35, family: FONT.sans})}
      ${caption({x: 1770, y: 730, text: '仓库', size: 35, fill: TOMATO, family: FONT.sans})}`,
  },
  'ep60-smart-http': {
    body: () => `
      ${emptyBackground({ep: '60', tag: 'smart http'})}
      ${monoLead({text: 'Smart HTTP', y: 430, fill: TEAL, size: 132})}
      ${zhLead({text: '认证接到 Git', y: 700, fill: TOMATO, size: 120})}
      ${arrow({x1: 1210, y1: 560, x2: 1460, y2: 560, color: MUSTARD, width: 17})}
      ${panel({x: 825, y: 350, width: 385, height: 420, accent: TEAL})}
      ${panel({x: 1460, y: 350, width: 400, height: 420, accent: TOMATO})}
      <text x="1018" y="485" text-anchor="middle" font-family="${FONT.mono}" font-size="51" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">WEB</text>
      <text x="1018" y="555" text-anchor="middle" font-family="${FONT.mono}" font-size="51" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">SERVER</text>
      ${K.refPill({x: 890, y: 625, label: 'AUTH', width: 255, height: 92, fill: MUSTARD, stroke: INK, text: INK, fontSize: 39, strokeWidth: 8, rx: 18})}
      <text x="1660" y="490" text-anchor="middle" font-family="${FONT.mono}" font-size="48" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">GIT</text>
      <text x="1660" y="558" text-anchor="middle" font-family="${FONT.mono}" font-size="48" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">BACKEND</text>
      ${K.commitNode({x: 1660, y: 680, label: 'OBJ', radius: 74, fill: PAPER, stroke: TOMATO, strokeWidth: 9, fontSize: 38})}
      ${caption({x: 1335, y: 510, text: 'RPC', size: 42, fill: MUSTARD})}`,
  },
  'ep61-git-daemon': {
    body: () => `
      ${emptyBackground({ep: '61', tag: 'git daemon'})}
      ${zhLead({text: '公开读取', y: 430, fill: TEAL, size: 156})}
      ${zhLead({text: '默认不写', y: 695, fill: TOMATO, size: 156})}
      ${arrow({x1: 850, y1: 430, x2: 1375, y2: 430, color: TEAL, width: 17})}
      <path d="M850 710 H1315" fill="none" stroke="${TOMATO}" stroke-width="17" stroke-linecap="round"/>
      <path d="M1265 657 L1365 757 M1365 657 L1265 757" fill="none" stroke="${TOMATO}" stroke-width="18" stroke-linecap="round"/>
      ${panel({x: 1375, y: 270, width: 470, height: 580, accent: INK})}
      <text x="1610" y="390" text-anchor="middle" font-family="${FONT.mono}" font-size="55" font-weight="${K.WEIGHT.bold}" fill="${INK}">git://</text>
      ${K.commitNode({x: 1610, y: 585, label: 'REPO', radius: 128, fill: MUSTARD, stroke: INK, strokeWidth: 12, fontSize: 49})}
      ${caption({x: 1060, y: 380, text: 'CLONE', size: 40, fill: TEAL})}
      ${caption({x: 1060, y: 665, text: 'PUSH', size: 40, fill: TOMATO})}
      ${caption({x: 1610, y: 790, text: 'exported', size: 34, fill: TEAL})}`,
  },
  'ep62-gitweb': {
    body: () => `
      ${emptyBackground({ep: '62', tag: 'gitweb source'})}
      ${monoLead({text: 'GitWeb', y: 445, fill: MUSTARD, size: 185})}
      ${zhLead({text: '看见同一对象', y: 700, fill: TEAL, size: 122})}
      <path d="M1375 555 L1110 365 M1375 555 L1110 755" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      ${card({x: 805, y: 270, width: 305, height: 190, label: 'TERMINAL', detail: 'git show', accent: TEAL, labelSize: 38})}
      ${card({x: 805, y: 660, width: 305, height: 190, label: 'WEB PAGE', detail: 'browse', accent: TOMATO, labelSize: 37})}
      ${K.commitNode({x: 1375, y: 555, label: 'C3', radius: 142, fill: MUSTARD, stroke: INK, strokeWidth: 13, fontSize: 62})}
      ${panel({x: 1575, y: 345, width: 280, height: 420, accent: INK})}
      <text x="1715" y="470" text-anchor="middle" font-family="${FONT.mono}" font-size="46" font-weight="${K.WEIGHT.bold}" fill="${INK}">OBJECT</text>
      <text x="1715" y="535" text-anchor="middle" font-family="${FONT.mono}" font-size="46" font-weight="${K.WEIGHT.bold}" fill="${INK}">STORE</text>
      <path d="M1517 555 H1575" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
      ${caption({x: 1715, y: 675, text: 'same OID', size: 34, fill: TEAL})}`,
  },
  'ep63-hosted-vs-self-hosted': {
    body: () => `
      ${emptyBackground({ep: '63', tag: 'hosting choice'})}
      ${zhLead({text: '托管还是', y: 430, fill: TEAL, size: 150})}
      ${zhLead({text: '自己维护', y: 695, fill: TOMATO, size: 150})}
      ${panel({x: 820, y: 260, width: 1040, height: 650, accent: INK})}
      <path d="M1100 260 V910 M1480 260 V910 M820 465 H1860 M820 670 H1860" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <text x="960" y="385" text-anchor="middle" font-family="${FONT.sans}" font-size="48" font-weight="${K.WEIGHT.bold}" fill="${INK}">责任</text>
      <text x="1290" y="385" text-anchor="middle" font-family="${FONT.mono}" font-size="47" font-weight="${K.WEIGHT.bold}" fill="${TEAL}">HOSTED</text>
      <text x="1670" y="385" text-anchor="middle" font-family="${FONT.mono}" font-size="42" font-weight="${K.WEIGHT.bold}" fill="${TOMATO}">SELF</text>
      <text x="960" y="585" text-anchor="middle" font-family="${FONT.sans}" font-size="43" font-weight="${K.WEIGHT.bold}" fill="${INK}">可用性</text>
      <text x="960" y="790" text-anchor="middle" font-family="${FONT.sans}" font-size="43" font-weight="${K.WEIGHT.bold}" fill="${INK}">恢复</text>
      <rect x="1165" y="515" width="250" height="100" rx="20" fill="${TEAL}"/>
      <rect x="1165" y="720" width="250" height="100" rx="20" fill="${TEAL}"/>
      <rect x="1545" y="515" width="250" height="100" rx="20" fill="${TOMATO}"/>
      <rect x="1545" y="720" width="250" height="100" rx="20" fill="${TOMATO}"/>
      ${caption({x: 1290, y: 582, text: '平台', size: 39, fill: PAPER, family: FONT.sans})}
      ${caption({x: 1290, y: 787, text: '平台', size: 39, fill: PAPER, family: FONT.sans})}
      ${caption({x: 1670, y: 582, text: '自己', size: 39, fill: PAPER, family: FONT.sans})}
      ${caption({x: 1670, y: 787, text: '自己', size: 39, fill: PAPER, family: FONT.sans})}`,
  },
  'ep64-operating-self-hosted-git': {
    body: () => `
      ${emptyBackground({ep: '64', tag: 'restore proof'})}
      ${zhLead({text: '备份成功', y: 430, fill: TEAL, size: 150})}
      ${zhLead({text: '≠ 能恢复', y: 700, fill: TOMATO, size: 160})}
      ${arrow({x1: 1100, y1: 555, x2: 1350, y2: 555, color: INK, width: 17})}
      ${arrow({x1: 1590, y1: 555, x2: 1730, y2: 555, color: TEAL, width: 17})}
      ${card({x: 785, y: 445, width: 315, height: 220, label: 'BACKUP', detail: 'objects + refs', accent: MUSTARD, labelSize: 47})}
      ${K.commitNode({x: 1470, y: 555, label: 'RESTORE', radius: 130, fill: PAPER, stroke: TOMATO, strokeWidth: 12, fontSize: 40})}
      ${K.commitNode({x: 1770, y: 555, label: '✓', radius: 100, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 11, fontSize: 76})}
      ${caption({x: 1470, y: 760, text: 'isolated', size: 34, fill: TOMATO})}
      ${caption({x: 1770, y: 730, text: 'verified', size: 34, fill: TEAL})}`,
  },
};

const requested = process.argv.slice(2);
const ids = requested.length > 0 ? requested : Object.keys(covers);

for (const id of ids) {
  const cover = covers[id];
  if (!cover) throw new Error(`Unknown cover episode: ${id}`);
  K.render({outDir: `renders/git-course/${id}/tmp/cover-candidate`, body: cover.body(), previews: true});
}
