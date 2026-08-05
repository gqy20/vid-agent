#!/usr/bin/env node
// Git Course · 课程总封面。
// 与单集封面共享纸张、网格和语义色，但不显示 EP 编号，也不复述单集问题。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL} = K;
const DISPLAY_FONT = 'Inter Display';
const TITLE_FONT = 'Noto Serif CJK SC';

// 抖音合集封面采用编辑式留白构图：标题保持第一视觉中心，
// 提交轨道直接落在课程统一的暖纸张上。HEAD 指向 main，main 再指向最新提交。
const body = `
  <!-- 正方形背景独立铺满；总封面与分集统一使用暖纸张和低对比网格。 -->
  <rect width="1080" height="1080" fill="url(#warmField)"/>
  <rect width="1080" height="1080" fill="url(#grid)" opacity="0.48"/>

  <!-- 左侧品牌 lockup：两行标题保持同一起始线，Git 承担主要视觉重量。 -->
  <g transform="translate(72 0)">
    <text x="0" y="306" font-family="${TITLE_FONT}" font-size="106" font-weight="${K.WEIGHT.bold}" fill="${INK}">看得见的</text>
    <text x="-8" y="686" font-family="${DISPLAY_FONT}" font-size="382" font-weight="800" fill="${TOMATO}">Git</text>
  </g>

  <!-- 右侧关系模型：历史边与 ref 连接线先画，节点和 ref pill 最后覆盖端点。 -->
  <g>
    <path d="M810 150 V590" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>

    <!-- main 指向最新提交；HEAD 再指向 main。两条线均伸入顶层对象，避免抗锯齿留缝。 -->
    <path d="M810 772 V672" stroke="${TEAL}" stroke-width="13" stroke-linecap="round"/>
    <path d="M792 702 L810 668 L828 702 Z" fill="${TEAL}"/>
    <path d="M810 914 V830" stroke="${MUSTARD}" stroke-width="13" stroke-linecap="round"/>
    <path d="M792 856 L810 822 L828 856 Z" fill="${MUSTARD}"/>

    <!-- 克制的实体阴影让纸白节点从同色背景中分离，不再依赖深色舞台。 -->
    <circle cx="820" cy="160" r="82" fill="${INK}" fill-opacity="0.13"/>
    <circle cx="820" cy="370" r="82" fill="${INK}" fill-opacity="0.13"/>
    <circle cx="822" cy="602" r="104" fill="${INK}" fill-opacity="0.15"/>

    ${K.commitNode({x: 810, y: 150, label: 'C0', radius: 76, fill: PAPER, stroke: INK, strokeWidth: 9, fontSize: 42})}
    ${K.commitNode({x: 810, y: 360, label: 'C1', radius: 76, fill: PAPER, stroke: INK, strokeWidth: 9, fontSize: 42})}
    ${K.commitNode({x: 810, y: 590, label: 'C2', radius: 98, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 10, fontSize: 50})}

    ${K.refPill({x: 716, y: 772, label: 'main', width: 188, height: 76, fill: TEAL, stroke: INK, text: PAPER, fontSize: 39, strokeWidth: 7, rx: 10})}
    ${K.refPill({x: 716, y: 914, label: 'HEAD', width: 188, height: 74, fill: MUSTARD, stroke: INK, text: INK, fontSize: 37, strokeWidth: 7, rx: 10})}
  </g>`;

// 16:9 版本不是正方形裁切：标题仍占左侧，提交历史改为横向展开，
// HEAD 与 main 垂直指向最新提交，保证 320×180 缩略图仍可读。
const wideBody = `
  <rect width="960" height="540" fill="url(#warmField)"/>
  <rect width="960" height="540" fill="url(#grid)" opacity="0.48"/>

  <g transform="translate(52 0)">
    <text x="0" y="184" font-family="${TITLE_FONT}" font-size="72" font-weight="${K.WEIGHT.bold}" fill="${INK}">看得见的</text>
    <text x="-6" y="430" font-family="${DISPLAY_FONT}" font-size="260" font-weight="800" fill="${TOMATO}">Git</text>
  </g>

  <g transform="translate(0 44)">
    <!-- 历史边、ref 连接线和箭头先画，节点与 pill 后画。 -->
    <path d="M540 305 H840" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M840 194 V225" stroke="${TEAL}" stroke-width="10" stroke-linecap="round"/>
    <path d="M828 215 L840 237 L852 215 Z" fill="${TEAL}"/>
    <path d="M840 89 V120" stroke="${MUSTARD}" stroke-width="10" stroke-linecap="round"/>
    <path d="M828 110 L840 132 L852 110 Z" fill="${MUSTARD}"/>

    <circle cx="548" cy="313" r="56" fill="${INK}" fill-opacity="0.13"/>
    <circle cx="698" cy="313" r="56" fill="${INK}" fill-opacity="0.13"/>
    <circle cx="849" cy="314" r="70" fill="${INK}" fill-opacity="0.15"/>

    ${K.commitNode({x: 540, y: 305, label: 'C0', radius: 50, fill: PAPER, stroke: INK, strokeWidth: 7, fontSize: 28})}
    ${K.commitNode({x: 690, y: 305, label: 'C1', radius: 50, fill: PAPER, stroke: INK, strokeWidth: 7, fontSize: 28})}
    ${K.commitNode({x: 840, y: 305, label: 'C2', radius: 64, fill: TEAL, stroke: INK, text: PAPER, strokeWidth: 8, fontSize: 34})}

    ${K.refPill({x: 774, y: 136, label: 'main', width: 132, height: 58, fill: TEAL, stroke: INK, text: PAPER, fontSize: 30, strokeWidth: 6, rx: 9})}
    ${K.refPill({x: 774, y: 35, label: 'HEAD', width: 132, height: 54, fill: MUSTARD, stroke: INK, text: INK, fontSize: 28, strokeWidth: 6, rx: 9})}
  </g>`;

const OUT_DIR = 'renders/git-course/series/tmp/cover-candidate';

K.render({outDir: OUT_DIR, body, previews: true, width: 1080, height: 1080});
K.render({outDir: OUT_DIR, name: 'cover-wide.svg', body: wideBody, previews: true, width: 960, height: 540});
