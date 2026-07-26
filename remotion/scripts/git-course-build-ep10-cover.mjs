#!/usr/bin/env node
// EP10 · 多种 revision 写法最终解析到同一个 commit。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const paths = `
  <path d="M770 755 C920 755 1080 820 1290 855" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
  <path d="M770 880 C930 880 1100 870 1290 855" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
  <path d="M770 1005 C930 1005 1080 920 1290 855" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>`;

const body = `
  ${K.bg({
    c1: {cx: 1680, cy: 440, rx: 540, ry: 330, fill: TEAL},
    c2: {cx: 35, cy: 1030, rx: 280, ry: 180, fill: TOMATO},
  })}
  ${K.badge({ep: '10', tag: 'revision'})}

  <text x="66" y="530" font-family="${FONT.mono}" font-size="234" font-weight="${K.WEIGHT.bold}" letter-spacing="-13" fill="${TOMATO}">revision</text>
  <text x="1250" y="516" font-family="${FONT.sans}" font-size="176" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">选中谁</text>

  ${paths}
  ${K.refPill({x: 380, y: 705, label: 'main', width: 390, height: 100, fill: PAPER, stroke: TEAL, fontSize: 45})}
  ${K.refPill({x: 380, y: 830, label: 'HEAD~2', width: 390, height: 100, fill: PAPER, stroke: INK, fontSize: 42})}
  ${K.refPill({x: 380, y: 955, label: '613b39e', width: 390, height: 100, fill: PAPER, stroke: TOMATO, fontSize: 39})}
  ${K.commitNode({x: 1290, y: 855, label: 'C2', radius: 82, fill: MUSTARD, stroke: INK, fontSize: 45, halo: TOMATO})}
`;

K.render({outDir: 'renders/git-course/ep10-selecting-revisions/tmp/cover-candidate', body, previews: true});
