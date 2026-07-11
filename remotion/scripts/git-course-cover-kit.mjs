#!/usr/bin/env node
// git-course-cover-kit.mjs — Git 课程封面共享视觉原语。
// 各集封面脚本 import 这里的 helper，自己只放本集数据 + 主视觉片段。
// 色板是独立"海报语言"（奶油底/芥末黄/番茄红/深墨/青绿），不复用视频 UI 的 palette.ts。
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const W = 1920;
export const H = 1080;

// 脚本位于 remotion/scripts/；据此定位 remotion 根，输出目录不再依赖 cwd。
export const REMOTION_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const INK = '#17211f';
export const PAPER = '#fffdf2';
export const MUSTARD = '#f5bf42';
export const TOMATO = '#b64e45';
export const TEAL = '#1f6869';
export const OLIVE = '#2f5f64';
export const MUTE = '#7a7261';

export const FONT = {
  sans: 'Noto Sans CJK SC',
  mono: 'JetBrains Mono',
};

// Both cover families ship as real Regular/Bold files only.
export const WEIGHT = {
  regular: 400,
  bold: 700,
};

export const esc = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const codeTokenRe = /([A-Za-z0-9][A-Za-z0-9._'/-]*)/g;

export const mixedText = ({text, x, y, fontSize, fill, weight = WEIGHT.bold, codeWeight = weight, textAnchor}) => {
  const parts = [];
  let cursor = 0;
  for (const match of String(text).matchAll(codeTokenRe)) {
    if (match.index > cursor) {
      const value = String(text).slice(cursor, match.index).trim();
      if (value) parts.push({value, family: FONT.sans, weight});
    }
    parts.push({value: match[0], family: FONT.mono, weight: codeWeight});
    cursor = match.index + match[0].length;
  }
  const tail = String(text).slice(cursor).trim();
  if (tail) parts.push({value: tail, family: FONT.sans, weight});

  const anchor = textAnchor ? ` text-anchor="${textAnchor}"` : '';
  const spans = parts
    .map(
      (part, index) =>
        `<tspan${index === 0 ? '' : ' dx="10"'} font-family="${part.family}" font-weight="${part.weight}">${esc(part.value)}</tspan>`,
    )
    .join('');
  return `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${fill}"${anchor}>${spans}</text>`;
};

export const DEFS = `
    <linearGradient id="warmField" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7edcf"/>
      <stop offset="0.58" stop-color="#efe8cc"/>
      <stop offset="1" stop-color="#dfe4cf"/>
    </linearGradient>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M52 0H0V52" fill="none" stroke="${INK}" stroke-width="1" opacity="0.13"/>
    </pattern>`;

export const softShadowRect = ({x = 0, y = 0, width, height, rx = 8, dx = 8, dy = 9, opacity = 0.18}) =>
  `<rect x="${x + dx}" y="${y + dy}" width="${width}" height="${height}" rx="${rx}" fill="${INK}" fill-opacity="${opacity}"/>`;

export const paperShadowRect = ({x = 0, y = 0, width, height, rx = 8}) => `
    <rect x="${x + 6}" y="${y + 10}" width="${width}" height="${height}" rx="${rx}" fill="${INK}" fill-opacity="0.07"/>
    <rect x="${x + 12}" y="${y + 18}" width="${width}" height="${height}" rx="${rx}" fill="${INK}" fill-opacity="0.04"/>`;

// 背景：暖色场 + 网格 + 两团氛围色。圆可覆盖以配合本集主视觉位置。
export const bg = ({
  c1 = {cx: 1498, cy: 626, r: 500, fill: TEAL},
  c2 = {cx: 260, cy: 840, r: 360, fill: TOMATO},
} = {}) => `
  <rect width="${W}" height="${H}" fill="url(#warmField)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.8"/>
  ${c1.rx || c1.ry ? `<ellipse cx="${c1.cx}" cy="${c1.cy}" rx="${c1.rx ?? c1.r}" ry="${c1.ry ?? c1.r}" fill="${c1.fill}" opacity="0.10"/>` : `<circle cx="${c1.cx}" cy="${c1.cy}" r="${c1.r}" fill="${c1.fill}" opacity="0.10"/>`}
  ${c2.rx || c2.ry ? `<ellipse cx="${c2.cx}" cy="${c2.cy}" rx="${c2.rx ?? c2.r}" ry="${c2.ry ?? c2.r}" fill="${c2.fill}" opacity="0.10"/>` : `<circle cx="${c2.cx}" cy="${c2.cy}" r="${c2.r}" fill="${c2.fill}" opacity="0.10"/>`}`;

// 右上角标：看得见的 Git · EP.N · tag
export const badge = ({ep, tag}) => `
  <g transform="translate(1506 34)">
    ${softShadowRect({width: 378, height: 86})}
    <rect width="378" height="86" rx="8" fill="${INK}" stroke="#ffffff" stroke-opacity="0.20" stroke-width="2"/>
    <path d="M32 31 L48 42 L62 29" stroke="${MUSTARD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M48 42 L60 57" stroke="${TEAL}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="31" r="8" fill="${TEAL}"/>
    <circle cx="48" cy="42" r="8" fill="${MUSTARD}"/>
    <circle cx="62" cy="29" r="8" fill="${TOMATO}"/>
    <circle cx="60" cy="57" r="8" fill="${PAPER}"/>
    <text x="92" y="42" font-family="${FONT.sans}" font-size="30" font-weight="${WEIGHT.bold}" fill="${PAPER}">看得见的 Git</text>
    <text x="94" y="68" font-family="${FONT.mono}" font-size="18" font-weight="${WEIGHT.bold}" fill="${PAPER}" fill-opacity="0.72">EP.${ep} · ${esc(tag)}</text>
  </g>`;

// 一级大标题（左上）
export const headline = (text) =>
  `<text x="66" y="150" font-family="${FONT.sans}" font-size="98" font-weight="${WEIGHT.bold}" fill="${INK}">${esc(text)}</text>`;

// 二级红框副标
export const subtitle = (text, {width = 440, x = 68, y = 306} = {}) => `
  <g transform="translate(${x} ${y})">
    ${softShadowRect({width, height: 91})}
    <rect width="${width}" height="91" rx="8" fill="${TOMATO}"/>
    ${mixedText({text, x: 26, y: 58, fontSize: 38, fill: PAPER, weight: WEIGHT.bold, codeWeight: WEIGHT.bold})}
  </g>`;

// 便签纸条（绝望命名等）
export const note = ({label, x, y, rotate, color = MUTE, width = 232}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate})">
    ${paperShadowRect({width, height: 68})}
    <rect x="0" y="0" width="${width}" height="68" rx="8" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.14" stroke-width="2"/>
    <text x="26" y="43" font-family="${FONT.sans}" font-size="24" font-weight="${WEIGHT.bold}" fill="${color}">${esc(label)}</text>
  </g>`;

// 对象贴纸（commit/tree/blob 等）
export const sticker = ({label, hash, x, y, rotate, fill, text = INK}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect x="10" y="12" width="224" height="112" rx="8" fill="${INK}" fill-opacity="0.18"/>
    <rect x="0" y="0" width="224" height="112" rx="8" fill="${fill}" stroke="${INK}" stroke-width="3"/>
    <text x="22" y="52" font-family="${FONT.mono}" font-size="31" font-weight="${WEIGHT.bold}" fill="${text}">${esc(label)}</text>
    <text x="24" y="90" font-family="${FONT.mono}" font-size="24" font-weight="${WEIGHT.bold}" fill="${text}">${esc(hash)}</text>
  </g>`;

// 不等号
export const neq = ({x = 828, y = 674} = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.sans}" font-size="180" font-weight="${WEIGHT.bold}" fill="${TOMATO}">≠</text>`;

// 组装 SVG、写盘、rsvg 转 PNG。outDir 相对 cwd（约定从 remotion/ 跑）。
export function render({outDir, name = 'cover.svg', body}) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${DEFS}</defs>
${body}
</svg>`;
  const svgPath = resolve(REMOTION_ROOT, outDir, name);
  mkdirSync(dirname(svgPath), {recursive: true});
  writeFileSync(svgPath, svg);
  const pngPath = svgPath.replace(/\.svg$/, '.png');
  // ponytail: 600 DPI = 1920*6.25 x 1080*6.25 像素（6.25 = 600/96，SVG 1px 默认 = 1/96 inch）
  execFileSync('rsvg-convert', ['-w', '12000', '-h', '6750', '-d', '600', '-f', 'png', '-o', pngPath, svgPath], {
    stdio: 'inherit',
  });
  console.log(`SVG: ${svgPath}`);
  console.log(`PNG: ${pngPath}`);
}
