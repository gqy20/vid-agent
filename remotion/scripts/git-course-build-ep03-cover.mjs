#!/usr/bin/env node
// EP03 · Commit 不是保存按钮 —— 软盘保存键 ≠ commit 对象字段卡
import * as K from './git-course-cover-kit.mjs';
const {INK, PAPER, MUSTARD, TOMATO, TEAL, MUTE, FONT, esc} = K;

const floppy = (x, y, s) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="0" width="240" height="240" rx="10" fill="${MUSTARD}" stroke="${INK}" stroke-width="6"/>
    <rect x="34" y="0" width="172" height="96" fill="#dfe0d4" stroke="${INK}" stroke-width="4"/>
    <rect x="146" y="20" width="44" height="56" fill="${INK}"/>
    <rect x="34" y="120" width="172" height="100" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
    <line x1="50" y1="150" x2="190" y2="150" stroke="${MUTE}" stroke-width="3"/>
    <line x1="50" y1="176" x2="166" y2="176" stroke="${MUTE}" stroke-width="3"/>
    <circle cx="64" cy="52" r="9" fill="${INK}"/>
  </g>`;

const body = `
  ${K.bg({c1: {cx: 1380, cy: 600, r: 460, fill: TEAL}, c2: {cx: 280, cy: 760, r: 360, fill: TOMATO}})}
  ${K.badge({ep: '03', tag: 'commit object'})}
  ${K.headline('Commit 不是保存按钮')}
  ${K.subtitle('它指向快照，也指向过去', {width: 480})}

  ${floppy(150, 470, 1.4)}
  <g transform="translate(206 826)" filter="url(#softShadow)">
    <rect width="200" height="64" rx="10" fill="${TEAL}"/>
    <text x="100" y="44" text-anchor="middle" font-family="${FONT.sans}" font-size="32" font-weight="900" fill="${PAPER}">保 存</text>
  </g>
  ${K.note({label: '按一下就完？', x: 50, y: 440, rotate: -10, color: TOMATO, width: 210})}

  ${K.neq({x: 858, y: 660})}

  <g transform="translate(980 420)">
    <rect width="820" height="540" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="4" filter="url(#softShadow)"/>
    <path d="M0 14 C0 6 6 0 14 0 H806 C814 0 820 6 820 14 V72 H0 Z" fill="${MUSTARD}"/>
    <text x="32" y="48" font-family="${FONT.mono}" font-size="30" font-weight="880" fill="${INK}">commit · a17c3f</text>

    <text x="40" y="138" font-family="${FONT.mono}" font-size="28" font-weight="840" fill="${TEAL}">tree</text>
    <text x="180" y="138" font-family="${FONT.mono}" font-size="28" font-weight="820" fill="${INK}">3f92e1b4…</text>
    <text x="540" y="138" font-family="${FONT.sans}" font-size="22" font-weight="780" fill="${MUTE}">→ 指向项目快照</text>

    <text x="40" y="200" font-family="${FONT.mono}" font-size="28" font-weight="840" fill="${TOMATO}">parent</text>
    <text x="180" y="200" font-family="${FONT.mono}" font-size="28" font-weight="820" fill="${INK}">9c4abd02…</text>
    <text x="540" y="200" font-family="${FONT.sans}" font-size="22" font-weight="780" fill="${MUTE}">→ 指向上一个 commit</text>

    <line x1="40" y1="232" x2="780" y2="232" stroke="rgba(23,33,31,0.14)" stroke-width="2"/>

    <text x="40" y="282" font-family="${FONT.mono}" font-size="26" font-weight="840" fill="${MUTE}">author</text>
    <text x="180" y="282" font-family="${FONT.mono}" font-size="26" font-weight="820" fill="${INK}">Git Coworker &lt;dev@x&gt;</text>

    <text x="40" y="334" font-family="${FONT.mono}" font-size="26" font-weight="840" fill="${MUTE}">time</text>
    <text x="180" y="334" font-family="${FONT.mono}" font-size="26" font-weight="820" fill="${INK}">2026-07-08 14:32</text>

    <text x="40" y="386" font-family="${FONT.mono}" font-size="26" font-weight="840" fill="${MUTE}">message</text>
    <text x="180" y="386" font-family="${FONT.mono}" font-size="26" font-weight="820" fill="${INK}">别再存 final-2.zip</text>

    <rect x="40" y="430" width="740" height="70" rx="10" fill="#fff6df" stroke="${MUSTARD}" stroke-width="2"/>
    <text x="60" y="474" font-family="${FONT.sans}" font-size="24" font-weight="840" fill="${INK}">一个对象：有身份（hash）、有结构、有过去</text>
  </g>`;

K.render({
  outDir: 'renders/git-course/ep03-commit-snapshot/renders/current/publishing',
  body,
});
