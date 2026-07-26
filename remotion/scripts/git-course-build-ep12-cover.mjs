#!/usr/bin/env node
// EP12 · origin/main 是本地对远端状态的记录，不住在服务器上。
import * as K from './git-course-cover-kit.mjs';

const {INK, PAPER, MUSTARD, TOMATO, TEAL, FONT} = K;

const repository = ({x, label, ref, commit, accent, local = false}) => `
  <g transform="translate(${x} 720)">
    ${K.softShadowRect({width: 820, height: 300, rx: 24, dx: 12, dy: 14, opacity: 0.18})}
    <rect width="820" height="300" rx="24" fill="${PAPER}" stroke="${local ? accent : INK}" stroke-width="${local ? 9 : 6}"/>
    <rect x="0" y="0" width="820" height="70" rx="20" fill="${accent}" fill-opacity="${local ? 0.20 : 0.12}"/>
    <text x="38" y="47" font-family="${FONT.mono}" font-size="31" font-weight="${K.WEIGHT.bold}" fill="${INK}">${label}</text>
    <path d="M430 188 H675" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
    ${K.refPill({x: 48, y: 132, label: ref, width: 390, height: 112, fill: local ? MUSTARD : TEAL, stroke: INK, text: local ? INK : PAPER, fontSize: ref.length > 6 ? 34 : 43})}
    ${K.commitNode({x: 675, y: 188, label: commit, radius: 67, fill: accent, stroke: INK, text: local ? INK : PAPER, fontSize: 37})}
  </g>`;

const body = `
  ${K.bg({
    c1: {cx: 1650, cy: 350, rx: 550, ry: 330, fill: TEAL},
    c2: {cx: 40, cy: 1020, rx: 280, ry: 180, fill: TOMATO},
  })}
  ${K.badge({ep: '12', tag: 'remote ref'})}

  <text x="66" y="480" font-family="${FONT.mono}" font-size="166" font-weight="${K.WEIGHT.bold}" letter-spacing="-11" fill="${TOMATO}">origin/main</text>
  <text x="1240" y="450" font-family="${FONT.sans}" font-size="155" font-weight="${K.WEIGHT.bold}" letter-spacing="-8" fill="${INK}">它在本地</text>

  ${repository({x: 50, label: 'SERVER', ref: 'main', commit: 'C2', accent: TEAL})}
  ${repository({x: 1050, label: 'LOCAL', ref: 'origin/main', commit: 'C1', accent: MUSTARD, local: true})}
`;

K.render({outDir: 'renders/git-course/ep12-remote-tracking-branches/tmp/cover-candidate', body, previews: true});
