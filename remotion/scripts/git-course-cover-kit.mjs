#!/usr/bin/env node
// git-course-cover-kit.mjs — Git 课程封面共享视觉原语。
// 各集封面脚本 import 这里的 helper，自己只放本集数据 + 主视觉片段。
// 色板是独立"海报语言"（奶油底/芥末黄/番茄红/深墨/青绿），不复用视频 UI 的 palette.ts。
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

export const W = 1920;
export const H = 1080;

export const INK = '#17211f';
export const PAPER = '#fffdf2';
export const MUSTARD = '#f5bf42';
export const TOMATO = '#b64e45';
export const TEAL = '#1f6869';
export const OLIVE = '#2f5f64';
export const MUTE = '#7a7261';

export const FONT = {
  sans: 'GitCourseBrand117, GitCourseSans, Noto Sans CJK SC, Source Han Sans SC, sans-serif',
  mono: 'GitCourseMono, JetBrains Mono, SFMono-Regular, Consolas, monospace',
};

export const esc = (v) =>
  String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const DEFS = `
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="8" dy="9" stdDeviation="0" flood-color="${INK}" flood-opacity="0.18"/>
    </filter>
    <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="${INK}" flood-opacity="0.11"/>
    </filter>
    <linearGradient id="warmField" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7edcf"/>
      <stop offset="0.58" stop-color="#efe8cc"/>
      <stop offset="1" stop-color="#dfe4cf"/>
    </linearGradient>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M52 0H0V52" fill="none" stroke="${INK}" stroke-width="1" opacity="0.13"/>
    </pattern>`;

// 背景：暖色场 + 网格 + 两团氛围色。圆可覆盖以配合本集主视觉位置。
export const bg = ({
  c1 = {cx: 1498, cy: 626, r: 500, fill: TEAL},
  c2 = {cx: 260, cy: 840, r: 360, fill: TOMATO},
} = {}) => `
  <rect width="${W}" height="${H}" fill="url(#warmField)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.8"/>
  <circle cx="${c1.cx}" cy="${c1.cy}" r="${c1.r}" fill="${c1.fill}" opacity="0.10"/>
  <circle cx="${c2.cx}" cy="${c2.cy}" r="${c2.r}" fill="${c2.fill}" opacity="0.10"/>`;

// 右上角标：看得见的 Git · EP.N · tag
export const badge = ({ep, tag}) => `
  <g filter="url(#softShadow)" transform="translate(1506 34)">
    <rect width="378" height="86" rx="8" fill="${INK}" stroke="rgba(255,255,255,0.20)" stroke-width="2"/>
    <path d="M32 31 L48 42 L62 29" stroke="${MUSTARD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M48 42 L60 57" stroke="${TEAL}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="31" r="8" fill="${TEAL}"/>
    <circle cx="48" cy="42" r="8" fill="${MUSTARD}"/>
    <circle cx="62" cy="29" r="8" fill="${TOMATO}"/>
    <circle cx="60" cy="57" r="8" fill="${PAPER}"/>
    <text x="92" y="42" font-family="${FONT.sans}" font-size="30" font-weight="920" fill="${PAPER}">看得见的 Git</text>
    <text x="94" y="68" font-family="${FONT.mono}" font-size="18" font-weight="820" fill="rgba(255,253,242,0.72)">EP.${ep} · ${esc(tag)}</text>
  </g>`;

// 一级大标题（左上）
export const headline = (text) =>
  `<text x="66" y="150" font-family="${FONT.sans}" font-size="98" font-weight="940" fill="${INK}">${esc(text)}</text>`;

// 二级红框副标
export const subtitle = (text, {width = 440, x = 68, y = 306} = {}) => `
  <g transform="translate(${x} ${y})" filter="url(#softShadow)">
    <rect width="${width}" height="91" rx="8" fill="${TOMATO}"/>
    <text x="26" y="58" font-family="${FONT.mono}" font-size="38" font-weight="930" fill="${PAPER}">${esc(text)}</text>
  </g>`;

// 便签纸条（绝望命名等）
export const note = ({label, x, y, rotate, color = MUTE, width = 232}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect x="0" y="0" width="${width}" height="68" rx="8" fill="${PAPER}" stroke="rgba(23,33,31,0.14)" stroke-width="2" filter="url(#paperShadow)"/>
    <text x="26" y="43" font-family="${FONT.sans}" font-size="24" font-weight="850" fill="${color}">${esc(label)}</text>
  </g>`;

// 对象贴纸（commit/tree/blob 等）
export const sticker = ({label, hash, x, y, rotate, fill, text = INK}) => `
  <g transform="translate(${x} ${y}) rotate(${rotate})">
    <rect x="10" y="12" width="224" height="112" rx="8" fill="rgba(23,33,31,0.18)"/>
    <rect x="0" y="0" width="224" height="112" rx="8" fill="${fill}" stroke="${INK}" stroke-width="3"/>
    <text x="22" y="52" font-family="${FONT.mono}" font-size="31" font-weight="930" fill="${text}">${esc(label)}</text>
    <text x="24" y="90" font-family="${FONT.mono}" font-size="24" font-weight="840" fill="${text}">${esc(hash)}</text>
  </g>`;

// 不等号
export const neq = ({x = 828, y = 674} = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT.sans}" font-size="180" font-weight="940" fill="${TOMATO}">≠</text>`;

// 组装 SVG、写盘、rsvg 转 PNG。outDir 相对 cwd（约定从 remotion/ 跑）。
export function render({outDir, name = '01_cover.svg', body}) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${DEFS}</defs>
${body}
</svg>`;
  const svgPath = resolve(outDir, name);
  mkdirSync(dirname(svgPath), {recursive: true});
  writeFileSync(svgPath, svg);
  const pngPath = svgPath.replace(/\.svg$/, '.png');
  execFileSync('rsvg-convert', ['-w', String(W), '-h', String(H), '-f', 'png', '-o', pngPath, svgPath], {
    stdio: 'inherit',
  });
  console.log(`SVG: ${svgPath}`);
  console.log(`PNG: ${pngPath}`);
}
