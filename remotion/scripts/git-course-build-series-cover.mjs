#!/usr/bin/env node
// Git Course · 课程总封面。
// 与单集封面共享纸张、网格和语义色，但不显示 EP 编号，也不复述单集问题。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL} = K;
const DISPLAY_FONT = 'Inter Display';
const TITLE_FONT = 'Noto Serif CJK SC';

// 抖音合集封面采用 62 / 38 的瑞士工业海报构图：标题保持编辑感，
// 深墨色斜切舞台把提交轨道提升为第二主角。HEAD 指向 main，main 再指向最新提交。
const body = `
  <!-- 正方形背景独立铺满；左侧保留纸张质感，右侧用斜切深墨舞台提高缩略图对比。 -->
  <rect width="1080" height="1080" fill="url(#warmField)"/>
  <rect width="1080" height="1080" fill="url(#grid)" opacity="0.48"/>
  <path d="M690 0 H1080 V1080 H600 Z" fill="${INK}"/>

  <!-- 左侧品牌 lockup：两行标题保持同一起始线，Git 承担主要视觉重量。 -->
  <g transform="translate(72 0)">
    <text x="0" y="286" font-family="${TITLE_FONT}" font-size="106" font-weight="${K.WEIGHT.bold}" fill="${INK}">看得见的</text>
    <text x="-8" y="646" font-family="${DISPLAY_FONT}" font-size="370" font-weight="800" fill="${TOMATO}">Git</text>
  </g>

  <!-- 提交轨道压在斜切舞台上：历史边、节点底圈与连接线先画，commit 节点最后覆盖端点。 -->
  <g>
    <path d="M734 140 V630" stroke="${PAPER}" stroke-width="22" stroke-linecap="round"/>
    <circle cx="748" cy="646" r="92" fill="${PAPER}" fill-opacity="0.16"/>

    <!-- ref 连接线先画并分别伸入 commit / pill，由顶层对象覆盖端点，避免抗锯齿留缝。 -->
    <path d="M734 804 V716" stroke="${PAPER}" stroke-width="19" stroke-linecap="round"/>
    <path d="M734 804 V716" stroke="${TEAL}" stroke-width="11" stroke-linecap="round"/>
    <path d="M716 742 L734 708 L752 742 Z" fill="${PAPER}"/>
    <path d="M720 738 L734 712 L748 738 Z" fill="${TEAL}"/>
    <path d="M872 930 L817 869" stroke="${MUSTARD}" stroke-width="11" stroke-linecap="round"/>
    <path d="M802 850 L827 861 L806 877 Z" fill="${MUSTARD}"/>

    <circle cx="734" cy="140" r="78" fill="${PAPER}"/>
    <circle cx="734" cy="385" r="78" fill="${PAPER}"/>
    <circle cx="734" cy="630" r="101" fill="${PAPER}"/>
    ${K.commitNode({x: 734, y: 140, label: 'C0', radius: 70, strokeWidth: 9, fontSize: 40})}
    ${K.commitNode({x: 734, y: 385, label: 'C1', radius: 70, strokeWidth: 9, fontSize: 40})}
    ${K.commitNode({x: 734, y: 630, label: 'C2', radius: 92, fill: TEAL, stroke: TEAL, text: PAPER, strokeWidth: 9, fontSize: 48})}

    <!-- main 位于 C2 下方并向上指向最新提交。 -->
    ${K.refPill({x: 649, y: 790, label: 'main', width: 170, height: 72, fill: TEAL, stroke: PAPER, text: PAPER, fontSize: 36, strokeWidth: 7, rx: 8})}

    <!-- HEAD 置于右下方，斜向指向 main，形成更松弛的阶梯关系。 -->
    ${K.refPill({x: 840, y: 910, label: 'HEAD', width: 170, height: 70, fill: MUSTARD, stroke: PAPER, text: INK, fontSize: 34, strokeWidth: 7, rx: 8})}
  </g>`;

K.render({outDir: 'renders/git-course/tmp/series-cover', body, previews: true, width: 1080, height: 1080});
