#!/usr/bin/env node
// EP11 · branch 继续移动，tag 留在原提交。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, TOMATO, TEAL, FONT} = K;

const graph = `
  <path d="M250 850 H1570" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
  <path d="M1570 750 V850 M910 850 V950" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  ${K.refPill({x: 1415, y: 650, label: 'main', width: 310, height: 100, fill: TEAL, stroke: INK, text: PAPER, fontSize: 43})}
  ${K.refPill({x: 740, y: 950, label: 'v1.0', width: 340, height: 100, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 43})}
  ${K.commitNode({x: 250, y: 850, label: 'C1', radius: 62, fill: PAPER, stroke: INK, fontSize: 34})}
  ${K.commitNode({x: 910, y: 850, label: 'C2', radius: 68, fill: TOMATO, stroke: INK, text: PAPER, fontSize: 37})}
  ${K.commitNode({x: 1570, y: 850, label: 'C3', radius: 72, fill: TEAL, stroke: INK, text: PAPER, fontSize: 39})}`;

const body = `
  ${K.bg({
    c1: {cx: 1510, cy: 295, rx: 550, ry: 330, fill: TEAL},
    c2: {cx: 60, cy: 1010, rx: 290, ry: 180, fill: TOMATO},
  })}
  ${K.badge({ep: '11', tag: 'tag'})}

  <text x="166" y="440" font-family="${FONT.mono}" font-size="330" font-weight="${K.WEIGHT.bold}" letter-spacing="-18" fill="${TOMATO}">tag</text>
  <text x="1070" y="423" font-family="${FONT.sans}" font-size="166" font-weight="${K.WEIGHT.bold}" letter-spacing="-9" fill="${INK}">谁会移动</text>

  ${graph}
`;

K.render({outDir: 'renders/git-course/ep11-tags/tmp/cover-candidate', body, previews: true});
