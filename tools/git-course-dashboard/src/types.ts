export type Artifact = {
  path: string;
  url: string;
  bytes: number;
  updatedAt: string;
};

export type ActionName = 'preview' | 'build' | 'approve' | 'promote' | 'release-build' | 'release-audit' | 'release-approve' | 'publish';

export type NextAction = {
  action: ActionName;
  label: string;
  cta: string;
  description: string;
  requiresNote: boolean;
  risk: 'normal' | 'review' | 'high';
};

export type ActionRun = {
  id: string;
  episodeId: string;
  action: ActionName;
  sceneId: string | null;
  state: 'running' | 'succeeded' | 'failed';
  command: string;
  output: string;
  startedAt: string;
  finishedAt: string | null;
  exitCode: number | null;
};

export type Check = {id: string; status: string; details: string};

export type Verdict = {
  verdict: string;
  artifactSha256: string | null;
  createdAt: string | null;
  approval: {reviewer?: string; approvedAt?: string; note?: string} | null;
  checks: Check[];
  evidence: Record<string, string>;
};

export type Scene = {
  index: number;
  id: string;
  title: string;
  start: number;
  duration: number;
  goal: string;
  segmentId: string | null;
  renderState: string;
  ttsState: string;
  cachePath: string | null;
  preview: {path: string; url: string} | null;
};

export type Episode = {
  id: string;
  title: string;
  durationSeconds: number;
  fps: number;
  resolution: {width: number; height: number};
  sceneCount: number;
  dirty: number;
  statusError: string | null;
  activity: {command?: string; pid?: number; startedAt?: string} | null;
  attention: 'running' | 'failed' | 'review' | 'dirty' | 'ready' | 'complete';
  nextAction: NextAction | null;
  stages: Record<string, string>;
  scenes: Scene[];
  artifacts: {
    candidate: Artifact | null;
    current: Artifact | null;
    releaseCandidate: Artifact | null;
    release: Artifact | null;
    mainReport: Artifact | null;
    releaseReport: Artifact | null;
  };
  manifests: {
    artifactSha256: string | null;
    candidateSha: string | null;
    currentSha: string | null;
    releaseCandidateSha: string | null;
    publishedReleaseSha: string | null;
    audioFileCount: number;
    previewUpdatedAt: string | null;
  };
  verdicts: {main: Verdict; release: Verdict};
  storage: {cache: number; build: number; preview: number; current: number};
};

export type Dashboard = {
  schemaVersion: number;
  generatedAt: string;
  episodes: Episode[];
  errors: Array<{file: string; message: string}>;
  summary: {episodes: number; dirty: number; needsReview: number; failed: number; busy: number};
};
