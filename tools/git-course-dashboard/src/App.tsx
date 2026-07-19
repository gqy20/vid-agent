import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ActionName, ActionRun, Artifact, Dashboard, Episode, NextAction, Scene, Verdict} from './types';

type QueueFilter = 'attention' | 'all' | 'dirty';
type InspectorTab = 'scenes' | 'audit' | 'runs';
type AuditScope = 'main' | 'release';
type MediaSelection = {
  kind: 'candidate' | 'current' | 'releaseCandidate' | 'release' | 'scene';
  title: string;
  artifact: Artifact | {url: string; path: string};
  sha: string | null;
  sceneId?: string;
  startAt?: number;
};

const stageLabels: Record<string, string> = {
  source: '内容源',
  tasks: 'Scene / TTS',
  candidate: 'Candidate',
  audit: 'Main Audit',
  current: 'Current',
  release: 'Release',
};

const attentionLabels = {
  running: 'RUNNING',
  failed: 'FAILED',
  review: 'REVIEW',
  dirty: 'DIRTY',
  ready: 'NEXT',
  complete: 'DONE',
};

const attentionPriority = {running: 0, failed: 1, review: 2, dirty: 3, ready: 4, complete: 5};
const matchesFilter = (episode: Episode, filter: QueueFilter) => filter === 'all'
  || filter === 'attention' && ['running', 'failed', 'review'].includes(episode.attention)
  || filter === 'dirty' && episode.dirty > 0;

const tone = (status: string) => {
  if (['ready', 'hit', 'pass', 'complete', 'succeeded'].includes(status)) return 'pass';
  if (['dirty', 'build', 'needs_review', 'review', 'running'].includes(status)) return 'wait';
  if (['fail', 'failed'].includes(status)) return 'fail';
  return 'muted';
};

const label = (status: string) => ({
  ready: 'READY',
  hit: 'HIT',
  build: 'BUILD',
  dirty: 'DIRTY',
  needs_review: 'REVIEW',
  pass: 'PASS',
  fail: 'FAIL',
  failed: 'FAILED',
  running: 'RUNNING',
  succeeded: 'DONE',
  missing: 'MISSING',
  unknown: 'UNKNOWN',
}[status] ?? status.toUpperCase());

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const shortSha = (sha: string | null) => sha ? sha.slice(0, 12) : '—';
const formatClock = (seconds: number) => {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const relativeDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('zh-CN', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(value))
  : '—';

function StatusPill({status}: {status: string}) {
  return <span className={`status status--${tone(status)}`}><i />{label(status)}</span>;
}

function StageMark({status}: {status: string}) {
  if (['ready', 'hit', 'pass', 'complete'].includes(status)) {
    return <span className="stage-mark" aria-label={label(status)} title={label(status)}>✓</span>;
  }
  return <StatusPill status={status} />;
}

function SceneSignals({scene}: {scene: Scene}) {
  const same = scene.renderState === scene.ttsState;
  const quiet = same && ['ready', 'hit', 'pass', 'complete'].includes(scene.renderState);
  const combined = [scene.renderState, scene.ttsState].find((state) => tone(state) === 'fail')
    ?? [scene.renderState, scene.ttsState].find((state) => tone(state) === 'wait')
    ?? scene.renderState;
  const text = same ? label(scene.renderState) : `V ${label(scene.renderState)} · A ${label(scene.ttsState)}`;
  const detail = `画面 ${label(scene.renderState)}，配音 ${label(scene.ttsState)}`;
  return <span className={`scene-state scene-state--${tone(combined)} ${quiet ? 'is-quiet' : ''}`} aria-label={detail} title={detail}><i />{quiet ? null : text}</span>;
}

function SummaryBar({dashboard, filter, onFilter}: {dashboard: Dashboard; filter: QueueFilter; onFilter: (filter: QueueFilter) => void}) {
  const items: Array<{id: QueueFilter; title: string; value: number}> = [
    {id: 'attention', title: '优先队列', value: dashboard.summary.needsReview + dashboard.summary.failed + dashboard.summary.busy},
    {id: 'dirty', title: '待重建', value: dashboard.summary.dirty},
    {id: 'all', title: '全部分集', value: dashboard.summary.episodes},
  ];
  return <nav className="summary-bar" aria-label="队列筛选">
    {items.map((item) => <button key={item.id} className={filter === item.id ? 'is-active' : ''} onClick={() => onFilter(item.id)}>
      <span>{item.title}</span><strong>{item.value}</strong>
    </button>)}
  </nav>;
}

function EpisodeQueue({episodes, selected, filter, onSelect}: {episodes: Episode[]; selected: string; filter: QueueFilter; onSelect: (id: string) => void}) {
  const visible = episodes
    .filter((episode) => matchesFilter(episode, filter))
    .sort((a, b) => attentionPriority[a.attention] - attentionPriority[b.attention] || a.id.localeCompare(b.id));
  return <aside className="episode-queue" aria-label="分集工作队列">
    <div className="queue-heading"><span>分集</span><small>{visible.length} / {episodes.length}</small></div>
    <div className="queue-list">
      {visible.map((episode) => <button key={episode.id} className={`queue-item ${selected === episode.id ? 'is-active' : ''}`} onClick={() => onSelect(episode.id)}>
        <span className="queue-number">{episode.id.slice(0, 4).toUpperCase()}</span>
        <span className="queue-copy">
          <strong>{episode.title}</strong>
          <small>{episode.dirty ? `${episode.dirty} dirty` : `${episode.sceneCount} 镜头`} · {formatTime(episode.durationSeconds)}</small>
        </span>
        <span className={`queue-state queue-state--${tone(episode.attention)}`}><i />{attentionLabels[episode.attention]}</span>
      </button>)}
      {visible.length === 0 && <div className="queue-empty">当前筛选没有待处理分集</div>}
    </div>
  </aside>;
}

function StageFlow({episode}: {episode: Episode}) {
  return <section className="stage-flow" aria-label="生产阶段">
    {Object.entries(stageLabels).map(([key, title], index) => <div className={`stage stage--${tone(episode.stages[key])}`} key={key}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <div><strong>{title}</strong><StageMark status={episode.stages[key]} /></div>
    </div>)}
  </section>;
}

function Player({episode, selection, onSelectVersion, previous, next}: {
  episode: Episode;
  selection: MediaSelection | null;
  onSelectVersion: (selection: MediaSelection) => void;
  previous: (() => void) | null;
  next: (() => void) | null;
}) {
  const playerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const choices: Array<MediaSelection | null> = [
    episode.artifacts.candidate && {kind: 'candidate', title: 'Candidate', artifact: episode.artifacts.candidate, sha: episode.manifests.candidateSha},
    episode.artifacts.current && {kind: 'current', title: 'Current', artifact: episode.artifacts.current, sha: episode.manifests.currentSha},
    episode.artifacts.releaseCandidate && {kind: 'releaseCandidate', title: 'Release Candidate', artifact: episode.artifacts.releaseCandidate, sha: episode.manifests.releaseCandidateSha},
    episode.artifacts.release && {kind: 'release', title: 'Published', artifact: episode.artifacts.release, sha: episode.manifests.publishedReleaseSha},
  ];
  const isScene = selection?.kind === 'scene';

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(selection?.startAt ?? 0);
    setMediaDuration(0);
  }, [selection?.artifact.url, selection?.sceneId, selection?.startAt]);

  const loadSelection = (video: HTMLVideoElement) => {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const startAt = Math.min(selection?.startAt ?? 0, duration || Number.POSITIVE_INFINITY);
    video.currentTime = startAt;
    setCurrentTime(startAt);
    setMediaDuration(duration);
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void player.requestFullscreen();
  };

  return <section className="player-panel" ref={playerRef}>
    <header className="player-heading">
      <h2>{isScene ? selection.title : '成片'}</h2>
      <div className="version-switcher">
        {choices.map((choice) => choice && <button key={choice.kind} aria-pressed={selection?.kind === choice.kind} className={selection?.kind === choice.kind ? 'is-active' : ''} onClick={() => onSelectVersion(choice)}>{choice.title}</button>)}
      </div>
    </header>
    {selection && <div className="video-controls" aria-label="视频控制">
      <button onClick={togglePlayback}>{playing ? '暂停' : '播放'}</button>
      <span className="video-time">{formatClock(currentTime)} / {formatClock(mediaDuration)}</span>
      <input
        aria-label="播放进度"
        type="range"
        min={0}
        max={mediaDuration || 0}
        step={0.05}
        value={mediaDuration ? Math.min(currentTime, mediaDuration) : 0}
        onChange={(event) => {
          const nextTime = Number(event.target.value);
          if (videoRef.current) videoRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }}
      />
      <button onClick={toggleMute}>{muted ? '取消静音' : '静音'}</button>
      <button onClick={toggleFullscreen}>全屏</button>
    </div>}
    <div className="video-shell">
      {selection ? <video
        key={`${selection.artifact.url}:${selection.sceneId ?? 'full'}:${selection.startAt ?? 0}`}
        ref={videoRef}
        src={selection.artifact.url}
        preload="metadata"
        onClick={togglePlayback}
        onDoubleClick={toggleFullscreen}
        onLoadedMetadata={(event) => loadSelection(event.currentTarget)}
        onDurationChange={(event) => setMediaDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      /> : <div className="empty-state">构建 Candidate 或生成 Scene Preview 后即可检查</div>}
    </div>
    <footer className="player-footer">
      <div className="scene-nav">
        <button disabled={!previous} onClick={() => previous?.()}>← 上一段</button>
        <button disabled={!next} onClick={() => next?.()}>下一段 →</button>
        <small>J / K 切换 Scene</small>
      </div>
      <div className="media-identity"><code>{selection?.artifact.path ?? '—'}</code><span>{shortSha(selection?.sha ?? null)}</span></div>
    </footer>
  </section>;
}

function SceneList({scenes, selectedId, onSelect, onPreview}: {
  scenes: Scene[];
  selectedId: string;
  onSelect: (scene: Scene) => void;
  onPreview: (scene: Scene) => void;
}) {
  return <div className="scene-list">
    {scenes.map((scene) => <button key={scene.id} className={`scene-item ${selectedId === scene.id ? 'is-active' : ''}`} onClick={() => onSelect(scene)}>
      <span className="scene-number">{String(scene.index).padStart(2, '0')}</span>
      <span className="scene-copy"><strong>{scene.title}</strong><small>{scene.id} · {formatTime(scene.start)}–{formatTime(scene.start + scene.duration)}</small></span>
      <SceneSignals scene={scene} />
      {!scene.preview && <span className="scene-preview-action" onClick={(event) => {event.stopPropagation(); onPreview(scene);}}>生成预览</span>}
    </button>)}
  </div>;
}

function AuditView({episode, scope, onScope, onReport}: {episode: Episode; scope: AuditScope; onScope: (scope: AuditScope) => void; onReport: (url: string) => void}) {
  const verdict: Verdict = episode.verdicts[scope];
  const report = scope === 'main' ? episode.artifacts.mainReport : episode.artifacts.releaseReport;
  const passed = verdict.checks.filter((check) => check.status === 'pass').length;
  return <div className="audit-view">
    <div className="scope-switcher">
      <button className={scope === 'main' ? 'is-active' : ''} onClick={() => onScope('main')}>Main</button>
      <button className={scope === 'release' ? 'is-active' : ''} onClick={() => onScope('release')}>Release</button>
    </div>
    <div className="audit-overview">
      <StatusPill status={verdict.verdict} />
      <div><small>机器检查</small><strong>{passed}/{verdict.checks.length}</strong></div>
      <div><small>Artifact SHA</small><code>{shortSha(verdict.artifactSha256)}</code></div>
      <div><small>生成时间</small><strong>{relativeDate(verdict.createdAt)}</strong></div>
    </div>
    <div className="check-list">
      {verdict.checks.map((check) => <div className="check-item" key={check.id}>
        <StatusPill status={check.status} />
        <span><strong>{check.id}</strong><small>{check.details}</small></span>
      </div>)}
      {verdict.checks.length === 0 && <div className="empty-row">尚未生成审查证据</div>}
    </div>
    {report && <button className="report-button" onClick={() => onReport(report.url)}>打开完整证据报告 ↗</button>}
  </div>;
}

function RunsView({episode, runs}: {episode: Episode; runs: ActionRun[]}) {
  const latest = runs[0];
  if (!latest && !episode.activity) return <div className="run-empty">执行操作后在这里查看日志</div>;
  if (!latest) return <div className="run-view"><div className="run-header"><StatusPill status="running" /><strong>{episode.activity?.command}</strong><code>PID {episode.activity?.pid}</code></div><pre>任务由外部终端启动，等待 orchestrator 状态更新…</pre></div>;
  return <div className="run-view">
    <div className="run-header"><StatusPill status={latest.state} /><strong>{latest.action}</strong><time>{relativeDate(latest.startedAt)}</time></div>
    <code className="run-command">{latest.command}</code>
    <pre>{latest.output || '任务已启动，等待第一条输出…'}</pre>
    {runs.length > 1 && <div className="run-history">{runs.slice(1, 6).map((run) => <div key={run.id}><StatusPill status={run.state} /><span>{run.action}</span><time>{relativeDate(run.startedAt)}</time></div>)}</div>}
  </div>;
}

function ActionDock({episode, action, note, busy, error, onNote, onRun}: {
  episode: Episode;
  action: NextAction | null;
  note: string;
  busy: boolean;
  error: string | null;
  onNote: (value: string) => void;
  onRun: (action: ActionName) => void;
}) {
  if (episode.activity || busy) return <div className="action-dock action-dock--running"><span className="eyebrow">运行中</span><strong>{episode.activity?.command ?? '正在启动任务'}</strong></div>;
  if (!action) return <div className="action-dock action-dock--done"><span className="eyebrow">已完成</span><strong>所有版本已同步</strong></div>;
  return <div className={`action-dock action-dock--${action.risk}`}>
    <span className="eyebrow">NEXT ACTION</span>
    <strong>{action.label}</strong>
    <p>{action.description}</p>
    {action.requiresNote && <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="填写人工审查结论" rows={3} />}
    {error && <div className="action-error">{error}</div>}
    <button className="action-primary" disabled={action.requiresNote && note.trim().length < 2} onClick={() => onRun(action.action)}>{action.cta}</button>
  </div>;
}

function Inspector({episode, tab, onTab, selectedSceneId, onScene, onPreview, auditScope, onAuditScope, onReport, runs, note, actionBusy, actionError, onNote, onRun}: {
  episode: Episode;
  tab: InspectorTab;
  onTab: (tab: InspectorTab) => void;
  selectedSceneId: string;
  onScene: (scene: Scene) => void;
  onPreview: (scene: Scene) => void;
  auditScope: AuditScope;
  onAuditScope: (scope: AuditScope) => void;
  onReport: (url: string) => void;
  runs: ActionRun[];
  note: string;
  actionBusy: boolean;
  actionError: string | null;
  onNote: (value: string) => void;
  onRun: (action: ActionName) => void;
}) {
  return <aside className="inspector">
    <div className="inspector-tabs">
      <button className={tab === 'scenes' ? 'is-active' : ''} onClick={() => onTab('scenes')}>Scenes <span>{episode.sceneCount}</span></button>
      <button className={tab === 'audit' ? 'is-active' : ''} onClick={() => onTab('audit')}>Audit <span>{episode.verdicts.main.checks.length}</span></button>
      <button className={tab === 'runs' ? 'is-active' : ''} onClick={() => onTab('runs')}>Runs <span>{runs.length}</span></button>
    </div>
    <div className="inspector-content">
      {tab === 'scenes' && <SceneList scenes={episode.scenes} selectedId={selectedSceneId} onSelect={onScene} onPreview={onPreview} />}
      {tab === 'audit' && <AuditView episode={episode} scope={auditScope} onScope={onAuditScope} onReport={onReport} />}
      {tab === 'runs' && <RunsView episode={episode} runs={runs} />}
    </div>
    <ActionDock episode={episode} action={episode.nextAction} note={note} busy={actionBusy} error={actionError} onNote={onNote} onRun={onRun} />
  </aside>;
}

function EvidenceOverlay({url, onClose}: {url: string; onClose: () => void}) {
  return <div className="evidence-overlay" role="dialog" aria-modal="true" aria-label="完整审查证据">
    <header><strong>完整审查报告</strong><button onClick={onClose}>关闭 ×</button></header>
    <iframe src={url} title="Git Course audit report" />
  </div>;
}

export function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [selection, setSelection] = useState<MediaSelection | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [filter, setFilter] = useState<QueueFilter>('attention');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('scenes');
  const [auditScope, setAuditScope] = useState<AuditScope>('main');
  const [runs, setRuns] = useState<ActionRun[]>([]);
  const [note, setNote] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastCompletion = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/dashboard', {cache: 'no-store'});
      if (!response.ok) throw new Error(`Dashboard API ${response.status}`);
      const next = await response.json() as Dashboard;
      setDashboard(next);
      setSelectedId((current) => {
        if (next.episodes.some((episode) => episode.id === current)) return current;
        return [...next.episodes].sort((a, b) => attentionPriority[a.attention] - attentionPriority[b.attention] || a.id.localeCompare(b.id))[0]?.id ?? '';
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRuns = useCallback(async () => {
    try {
      const response = await fetch('/api/runs', {cache: 'no-store'});
      if (!response.ok) return;
      const next = (await response.json()) as {runs: ActionRun[]};
      setRuns(next.runs);
      const completion = next.runs.find((run) => run.finishedAt)?.finishedAt ?? null;
      if (completion && completion !== lastCompletion.current) {
        lastCompletion.current = completion;
        void refresh();
      }
    } catch {
      // Dashboard state remains usable when the ephemeral run feed is unavailable.
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
    void refreshRuns();
    const dashboardTimer = window.setInterval(() => void refresh(), 30000);
    const runTimer = window.setInterval(() => void refreshRuns(), 2500);
    return () => {window.clearInterval(dashboardTimer); window.clearInterval(runTimer);};
  }, [refresh, refreshRuns]);

  const episode = useMemo(() => dashboard?.episodes.find((item) => item.id === selectedId) ?? null, [dashboard, selectedId]);
  const episodeRuns = useMemo(() => runs.filter((run) => run.episodeId === selectedId), [runs, selectedId]);
  const activeRun = episodeRuns.some((run) => run.state === 'running');

  useEffect(() => {
    if (!dashboard) return;
    const visible = dashboard.episodes
      .filter((item) => matchesFilter(item, filter))
      .sort((a, b) => attentionPriority[a.attention] - attentionPriority[b.attention] || a.id.localeCompare(b.id));
    if (!visible.some((item) => item.id === selectedId)) setSelectedId(visible[0]?.id ?? '');
  }, [dashboard, filter, selectedId]);

  useEffect(() => {
    if (!episode) return;
    const preferred = episode.artifacts.candidate
      ? {kind: 'candidate' as const, title: 'Candidate', artifact: episode.artifacts.candidate, sha: episode.manifests.candidateSha}
      : episode.artifacts.current
        ? {kind: 'current' as const, title: 'Current', artifact: episode.artifacts.current, sha: episode.manifests.currentSha}
        : episode.artifacts.release
          ? {kind: 'release' as const, title: 'Published', artifact: episode.artifacts.release, sha: episode.manifests.publishedReleaseSha}
          : null;
    setSelection(preferred);
    setSelectedSceneId(episode.scenes[0]?.id ?? '');
    setNote('');
    setActionError(null);
  }, [episode?.id, episode?.manifests.candidateSha]);

  const selectScene = useCallback((scene: Scene) => {
    setSelectedSceneId(scene.id);
    const fallback = episode?.artifacts.candidate
      ? {artifact: episode.artifacts.candidate, sha: episode.manifests.candidateSha}
      : episode?.artifacts.current
        ? {artifact: episode.artifacts.current, sha: episode.manifests.currentSha}
        : episode?.artifacts.releaseCandidate
          ? {artifact: episode.artifacts.releaseCandidate, sha: episode.manifests.releaseCandidateSha}
          : episode?.artifacts.release
            ? {artifact: episode.artifacts.release, sha: episode.manifests.publishedReleaseSha}
            : null;
    if (scene.preview) {
      setSelection({kind: 'scene', title: `${String(scene.index).padStart(2, '0')} · ${scene.title}`, artifact: scene.preview, sha: null, sceneId: scene.id, startAt: 0});
    } else if (fallback) {
      setSelection({kind: 'scene', title: `${String(scene.index).padStart(2, '0')} · ${scene.title}`, artifact: fallback.artifact, sha: fallback.sha, sceneId: scene.id, startAt: scene.start});
    } else {
      setSelection(null);
    }
  }, [episode]);

  const selectedSceneIndex = episode?.scenes.findIndex((scene) => scene.id === selectedSceneId) ?? -1;
  const previous = episode && selectedSceneIndex > 0 ? () => selectScene(episode.scenes[selectedSceneIndex - 1]) : null;
  const next = episode && selectedSceneIndex >= 0 && selectedSceneIndex < episode.scenes.length - 1 ? () => selectScene(episode.scenes[selectedSceneIndex + 1]) : null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key.toLowerCase() === 'j') previous?.();
      if (event.key.toLowerCase() === 'k') next?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previous, next]);

  const runAction = useCallback(async (action: ActionName, sceneId?: string) => {
    if (!episode) return;
    setActionBusy(true);
    setActionError(null);
    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({episodeId: episode.id, action, sceneId, note}),
      });
      const payload = await response.json() as ActionRun | {error: string};
      if (!response.ok) throw new Error('error' in payload ? payload.error : `Action API ${response.status}`);
      setRuns((current) => [payload as ActionRun, ...current.filter((run) => run.id !== (payload as ActionRun).id)]);
      setInspectorTab('runs');
      setNote('');
      window.setTimeout(() => void refresh(), 800);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setActionBusy(false);
    }
  }, [episode, note, refresh]);

  if (loading) return <main className="loading-screen"><div className="loading-skeleton"><i /><i /><i /></div><p>正在读取生产状态…</p></main>;
  if (!dashboard || error) return <main className="loading-screen"><div className="error-mark">!</div><h1>控制台暂时不可用</h1><p>{error}</p><button onClick={() => void refresh()}>重新连接</button></main>;

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">GC</span><div><strong>Git Course</strong><small>Review Workbench</small></div></div>
      <SummaryBar dashboard={dashboard} filter={filter} onFilter={setFilter} />
      <div className="topbar-meta"><time>{relativeDate(dashboard.generatedAt)}</time><button onClick={() => {void refresh(); void refreshRuns();}}>刷新</button></div>
    </header>
    <div className="review-shell">
      <EpisodeQueue episodes={dashboard.episodes} selected={selectedId} filter={filter} onSelect={setSelectedId} />
      {episode && <main className="review-main">
        <div className="episode-overview">
          <header className="episode-header">
            <div><span className="episode-kicker">{episode.id}</span><h1>{episode.title}</h1><p>{episode.sceneCount} 个镜头 · {formatTime(episode.durationSeconds)} · {episode.resolution.width}×{episode.resolution.height} · {episode.fps}fps</p></div>
            <StageFlow episode={episode} />
          </header>
          {episode.statusError && <div className="notice notice--error">orchestrator 状态读取失败：{episode.statusError}</div>}
        </div>
        <Player episode={episode} selection={selection} onSelectVersion={(value) => {setSelection(value); setSelectedSceneId('');}} previous={previous} next={next} />
      </main>}
      {episode && <Inspector
        episode={episode}
        tab={inspectorTab}
        onTab={setInspectorTab}
        selectedSceneId={selectedSceneId}
        onScene={selectScene}
        onPreview={(scene) => void runAction('preview', scene.id)}
        auditScope={auditScope}
        onAuditScope={setAuditScope}
        onReport={setReportUrl}
        runs={episodeRuns}
        note={note}
        actionBusy={actionBusy || activeRun}
        actionError={actionError}
        onNote={setNote}
        onRun={(action) => void runAction(action)}
      />}
    </div>
    {reportUrl && <EvidenceOverlay url={reportUrl} onClose={() => setReportUrl(null)} />}
  </div>;
}
