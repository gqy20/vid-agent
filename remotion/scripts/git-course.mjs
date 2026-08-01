#!/usr/bin/env node

import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REMOTION_ROOT = join(ROOT, 'remotion');
const COURSE_ROOT = join(ROOT, 'git-course/episodes');
const EPISODES = [
  ['ep01-what-git-stores', 'GitCourseEp01WhatGitStores', 'EP01'],
  ['ep02-working-tree-index-repo', 'GitCourseEp02WorkingTreeIndexRepo', 'EP02'],
  ['ep03-commit-snapshot', 'GitCourseEp03CommitSnapshot', 'EP03'],
  ['ep04-branch-is-pointer', 'GitCourseEp04BranchIsPointer', 'EP04'],
  ['ep05-head', 'GitCourseEp05Head', 'EP05'],
  ['ep06-merge', 'GitCourseEp06Merge', 'EP06'],
  ['ep07-rebase', 'GitCourseEp07Rebase', 'EP07'],
  ['ep08-reset-revert-restore', 'GitCourseEp08ResetRevertRestore', 'EP08'],
  ['ep09-diff-compares-states', 'GitCourseEp09DiffComparesStates', 'EP09'],
  ['ep10-selecting-revisions', 'GitCourseEp10SelectingRevisions', 'EP10'],
  ['ep11-tags', 'GitCourseEp11Tags', 'EP11'],
  ['ep12-remote-tracking-branches', 'GitCourseEp12RemoteTrackingBranches', 'EP12'],
  ['ep13-fetch-pull-push', 'GitCourseEp13FetchPullPush', 'EP13'],
  ['ep14-ahead-behind-non-fast-forward', 'GitCourseEp14AheadBehindNonFastForward', 'EP14'],
  ['ep15-unmerged-index', 'GitCourseEp15UnmergedIndex', 'EP15'],
  ['ep16-reflog-recovery', 'GitCourseEp16ReflogRecovery', 'EP16'],
  ['ep17-interactive-staging', 'GitCourseEp17InteractiveStaging', 'EP17'],
  ['ep18-stashing-work', 'GitCourseEp18StashingWork', 'EP18'],
  ['ep19-cherry-pick', 'GitCourseEp19CherryPick', 'EP19'],
  ['ep20-rewriting-history', 'GitCourseEp20RewritingHistory', 'EP20'],
  ['ep21-searching-history', 'GitCourseEp21SearchingHistory', 'EP21'],
  ['ep22-blame', 'GitCourseEp22Blame', 'EP22'],
  ['ep23-bisect', 'GitCourseEp23Bisect', 'EP23'],
  ['ep24-rerere', 'GitCourseEp24Rerere', 'EP24'],
  ['ep25-long-lived-and-topic-branches', 'GitCourseEp25LongLivedAndTopicBranches', 'EP25'],
  ['ep26-centralized-workflow', 'GitCourseEp26CentralizedWorkflow', 'EP26'],
  ['ep27-integration-manager-workflow', 'GitCourseEp27IntegrationManagerWorkflow', 'EP27'],
  ['ep28-preparing-clean-contributions', 'GitCourseEp28PreparingCleanContributions', 'EP28'],
  ['ep29-patch-series', 'GitCourseEp29PatchSeries', 'EP29'],
  ['ep30-maintaining-topic-branches', 'GitCourseEp30MaintainingTopicBranches', 'EP30'],
  ['ep31-release-and-maintenance-branches', 'GitCourseEp31ReleaseAndMaintenanceBranches', 'EP31'],
  ['ep32-choosing-integration-strategy', 'GitCourseEp32ChoosingIntegrationStrategy', 'EP32'],
  ['ep33-configuration-scopes', 'GitCourseEp33ConfigurationScopes', 'EP33'],
  ['ep34-ignore-rules-and-excludes', 'GitCourseEp34IgnoreRulesAndExcludes', 'EP34'],
  ['ep35-attributes-text-and-binary', 'GitCourseEp35AttributesTextAndBinary', 'EP35'],
  ['ep36-custom-diff-merge-and-filters', 'GitCourseEp36CustomDiffMergeAndFilters', 'EP36'],
  ['ep37-client-hooks', 'GitCourseEp37ClientHooks', 'EP37'],
  ['ep38-server-hooks-and-policy', 'GitCourseEp38ServerHooksAndPolicy', 'EP38'],
  ['ep39-signing-commits-and-tags', 'GitCourseEp39SigningCommitsAndTags', 'EP39'],
  ['ep40-credentials-and-trust-boundaries', 'GitCourseEp40CredentialsAndTrustBoundaries', 'EP40'],
  ['ep41-submodule-pointer-model', 'GitCourseEp41SubmodulePointerModel', 'EP41'],
  ['ep42-cloning-and-updating-submodules', 'GitCourseEp42CloningAndUpdatingSubmodules', 'EP42'],
  ['ep43-collaborating-with-submodules', 'GitCourseEp43CollaboratingWithSubmodules', 'EP43'],
  ['ep44-multiple-worktrees', 'GitCourseEp44MultipleWorktrees', 'EP44'],
  ['ep45-git-bundle', 'GitCourseEp45GitBundle', 'EP45'],
  ['ep46-sparse-partial-and-shallow-clones', 'GitCourseEp46SparsePartialAndShallowClones', 'EP46'],
  ['ep47-clean-and-destructive-boundaries', 'GitCourseEp47CleanAndDestructiveBoundaries', 'EP47'],
  ['ep48-maintenance-and-data-recovery', 'GitCourseEp48MaintenanceAndDataRecovery', 'EP48'],
];

const fail = (message) => {
  throw new Error(message);
};

const loadEpisode = ([id, composition, symbol]) => {
  const path = join(COURSE_ROOT, `${id}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  data.episodeId === id || fail(`${path}: episodeId must be ${id}`);
  Array.isArray(data.scenes) && data.scenes.length > 0 || fail(`${path}: scenes must not be empty`);
  let cursor = 0;
  const ids = new Set();
  for (const scene of data.scenes) {
    typeof scene.id === 'string' && scene.id.length > 0 || fail(`${path}: scene id is required`);
    !ids.has(scene.id) || fail(`${path}: duplicate scene id ${scene.id}`);
    ids.add(scene.id);
    Number.isFinite(scene.start) && Number.isFinite(scene.duration) && scene.duration > 0 || fail(`${path}: invalid timing for ${scene.id}`);
    Math.abs(scene.start * data.fps - Math.round(scene.start * data.fps)) < 1e-7 || fail(`${path}: ${scene.id} start must align to a ${data.fps}fps frame`);
    Math.abs(scene.duration * data.fps - Math.round(scene.duration * data.fps)) < 1e-7 || fail(`${path}: ${scene.id} duration must align to a ${data.fps}fps frame`);
    scene.start === cursor || fail(`${path}: ${scene.id} starts at ${scene.start}, expected ${cursor}`);
    if (scene.captions !== undefined) {
      Array.isArray(scene.captions) || fail(`${path}: ${scene.id}.captions must be an array`);
      let previousCaptionEnd = 0;
      for (const caption of scene.captions) {
        Number.isFinite(caption.from) && Number.isFinite(caption.to) && caption.from >= 0 && caption.to > caption.from || fail(`${path}: ${scene.id} has an invalid caption range`);
        caption.from >= previousCaptionEnd || fail(`${path}: ${scene.id} captions must not overlap`);
        caption.to <= scene.duration || fail(`${path}: ${scene.id} caption exceeds scene duration`);
        typeof caption.text === 'string' && caption.text.trim().length > 0 || fail(`${path}: ${scene.id} caption text is required`);
        previousCaptionEnd = caption.to;
      }
    }
    cursor += scene.duration;
  }
  cursor === data.durationSeconds || fail(`${path}: scenes end at ${cursor}, durationSeconds is ${data.durationSeconds}`);
  data.durationSeconds >= 150 && data.durationSeconds <= 300 || fail(`${path}: duration must be approximately 2.5–5 minutes`);
  return {id, composition, symbol, ...data};
};

const validateNarration = (episode) => {
  let previousStart = -1;
  const ids = new Set();
  episode.scenes.forEach((scene, index) => {
    const {segmentId, voiceStart: start, text} = scene.narration ?? {};
    Number.isFinite(start) || fail(`${episode.id}:${scene.id}: narration.voiceStart must be a number`);
    typeof text === 'string' && text.trim().length > 0 || fail(`${episode.id}:${scene.id}: narration.text is required`);
    !ids.has(segmentId) || fail(`${episode.id}:${scene.id}: duplicate segment id ${segmentId}`);
    ids.add(segmentId);
    const end = scene.start + scene.duration;
    start >= scene.start - 0.5 && start < end || fail(`${episode.id}:${scene.id}: voice start is outside its scene transition tolerance`);
    start > previousStart || fail(`${episode.id}:${scene.id}: narration must be ordered`);
    previousStart = start;
  });
};

const validateReleaseMetadata = (episode) => {
  const markdown = episode.release?.bilibiliMarkdown;
  typeof markdown === 'string' && markdown.trim().length > 0 || fail(`${episode.id}: release.bilibiliMarkdown is required`);
  markdown.split('## 官方参考').length === 2 || fail(`${episode.id}: bilibiliMarkdown must contain exactly one 官方参考 section`);
  const referenceStart = markdown.indexOf('\n## 官方参考\n');
  const tagStart = markdown.indexOf('\n## 标签\n', referenceStart);
  referenceStart >= 0 && tagStart > referenceStart || fail(`${episode.id}: 官方参考 must appear immediately before 标签`);
  const referenceSection = markdown.slice(referenceStart, tagStart);
  /https:\/\/git-scm\.com\/[^)\s]+/.test(referenceSection) || fail(`${episode.id}: 官方参考 must include at least one git-scm.com link`);
};

const timelineSource = (episodes) => {
  const blocks = episodes.map((episode) => {
    const scenes = episode.scenes.map(({id, title, duration, captions}) => {
      const captionsSource = captions ? `, captions: ${JSON.stringify(captions)}` : '';
      return `  {id: ${JSON.stringify(id)}, title: ${JSON.stringify(title)}, duration: seconds(${duration})${captionsSource}},`;
    }).join('\n');
    return `export const ${episode.symbol}_SCENES = [\n${scenes}\n] as const;\nexport const ${episode.symbol}_DURATION_IN_FRAMES = ${episode.symbol}_SCENES.reduce((sum, scene) => sum + scene.duration, 0);`;
  });
  return `// Generated by scripts/git-course.mjs from git-course/episodes/*.json.\n// Do not edit by hand.\nimport {seconds} from '../timeline';\n\n${blocks.join('\n\n')}\n`;
};

const generateTimelines = (episodes) => {
  const target = join(REMOTION_ROOT, 'src/videos/git-course/data/episodeTimelines.generated.ts');
  writeFileSync(target, timelineSource(episodes));
};

const generateNarrationSource = (episode) => {
  const dir = join(REMOTION_ROOT, 'renders/git-course', episode.id, 'tmp/narration-source');
  mkdirSync(dir, {recursive: true});
  const rows = ['# segment_id\tvoice_start_seconds\tscene_end_seconds'];
  for (const scene of episode.scenes) {
    const {segmentId, voiceStart, text} = scene.narration;
    writeFileSync(join(dir, `${segmentId}.txt`), `${text.trimEnd()}\n`);
    rows.push(`${segmentId}\t${voiceStart}\t${scene.start + scene.duration}`);
  }
  writeFileSync(join(dir, 'manifest.tsv'), `${rows.join('\n')}\n`);
  if (episode.content?.alignmentMarkdown) {
    writeFileSync(join(dir, 'alignment.md'), episode.content.alignmentMarkdown);
  }
  return join(dir, 'manifest.tsv');
};

const generateReleaseSource = (episode) => {
  const documents = [
    ['bilibili.md', episode.release?.bilibiliMarkdown],
    ['checklist.md', episode.release?.checklistMarkdown],
    ['cover-brief.md', episode.release?.coverBriefMarkdown],
    ['audio-alignment.md', episode.content?.alignmentMarkdown],
  ].filter(([, content]) => typeof content === 'string' && content.length > 0);
  if (documents.length === 0) return [];
  const dir = join(REMOTION_ROOT, 'renders/git-course', episode.id, 'tmp/release-source');
  mkdirSync(dir, {recursive: true});
  return documents.map(([name, content]) => {
    const path = join(dir, name);
    writeFileSync(path, content);
    return path;
  });
};

const validateTypographyTokens = () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
    }
  };
  walk(join(REMOTION_ROOT, 'src/videos/git-course'));
  for (const entry of readdirSync(join(REMOTION_ROOT, 'scripts'))) {
    if (/^git-course-(?:cover-kit|build-ep\d+-cover)\.mjs$/.test(entry)) {
      files.push(join(REMOTION_ROOT, 'scripts', entry));
    }
  }

  const numericWeight = /fontWeight\s*(?::|=)\s*(?:\{\s*)?["']?\d{3}|font-weight=["']\d{3}|(?:code)?weight\s*:\s*\d{3}/;
  for (const path of files) {
    !numericWeight.test(readFileSync(path, 'utf8')) || fail(`${path}: use WEIGHT tokens instead of a numeric font weight`);
  }
};

const validate = ({checkGenerated = true} = {}) => {
  const episodes = EPISODES.map(loadEpisode);
  episodes.forEach(validateNarration);
  episodes.forEach(validateReleaseMetadata);
  validateTypographyTokens();
  const generated = join(REMOTION_ROOT, 'src/videos/git-course/data/episodeTimelines.generated.ts');
  if (checkGenerated && existsSync(generated)) {
    readFileSync(generated, 'utf8') === timelineSource(episodes) || fail(`${generated}: stale; run pnpm git-course:generate`);
  }
  return episodes;
};

const command = process.argv[2] ?? 'validate';
const episodeId = process.argv[3];
const episodes = validate({checkGenerated: command !== 'generate'});

if (command === 'validate') {
  console.log(`Validated ${episodes.length} episode JSON files, narration timelines, and release metadata.`);
} else if (command === 'generate') {
  generateTimelines(episodes);
  console.log('Generated Remotion timelines from episode JSON files.');
} else if (command === 'narration') {
  const episode = episodes.find((item) => item.id === episodeId) ?? fail(`Unknown episode: ${episodeId}`);
  console.log(generateNarrationSource(episode));
} else if (command === 'release') {
  const episode = episodes.find((item) => item.id === episodeId) ?? fail(`Unknown episode: ${episodeId}`);
  const generated = generateReleaseSource(episode);
  console.log(generated.length > 0 ? generated.join('\n') : `${episode.id}: no release source`);
} else {
  fail(`Usage: git-course.mjs validate|generate|narration|release <episode-id>`);
}
