import {Sequence} from 'remotion';
import type {NarrationCaptionCue} from '../explain/NarrationSubtitle';

export type RuntimeScene = {
  readonly id: string;
  readonly title: string;
  readonly duration: number;
  readonly captions?: readonly NarrationCaptionCue[];
};

export type SceneId<TScenes extends readonly RuntimeScene[]> = TScenes[number]['id'];

export type EpisodeRuntime<TScenes extends readonly RuntimeScene[]> = {
  readonly scenes: TScenes;
  readonly start: (id: SceneId<TScenes>) => number;
  readonly duration: (id: SceneId<TScenes>) => number;
  readonly captions: (id: SceneId<TScenes>) => readonly NarrationCaptionCue[];
  readonly sequenceProps: (id: SceneId<TScenes>) => {readonly from: number; readonly durationInFrames: number};
};

export const createEpisodeRuntime = <const TScenes extends readonly RuntimeScene[]>(
  scenes: TScenes,
): EpisodeRuntime<TScenes> => {
  const sceneById = new Map<string, RuntimeScene>();
  const startById = new Map<string, number>();
  let cursor = 0;

  for (const scene of scenes) {
    if (sceneById.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
    if (scene.duration <= 0) throw new Error(`Scene duration must be positive: ${scene.id}`);
    sceneById.set(scene.id, scene);
    startById.set(scene.id, cursor);
    cursor += scene.duration;
  }

  const getScene = (id: SceneId<TScenes>): RuntimeScene => {
    const scene = sceneById.get(id);
    if (!scene) throw new Error(`Unknown scene: ${id}`);
    return scene;
  };

  const start = (id: SceneId<TScenes>) => {
    const value = startById.get(id);
    if (value === undefined) throw new Error(`Unknown scene: ${id}`);
    return value;
  };

  const duration = (id: SceneId<TScenes>) => getScene(id).duration;

  return {
    scenes,
    start,
    duration,
    captions: (id) => getScene(id).captions ?? [],
    sequenceProps: (id) => ({from: start(id), durationInFrames: duration(id)}),
  };
};

type SceneComponents<TScenes extends readonly RuntimeScene[]> = {
  readonly [Id in SceneId<TScenes>]: React.ComponentType;
};

export const EpisodeTimeline = <const TScenes extends readonly RuntimeScene[]>({
  runtime,
  components,
}: {
  readonly runtime: EpisodeRuntime<TScenes>;
  readonly components: SceneComponents<TScenes>;
}) => (
  <>
    {runtime.scenes.map((scene) => {
      const id = scene.id as SceneId<TScenes>;
      const Scene = components[id] as React.ComponentType<Record<string, never>>;
      return (
        <Sequence key={id} {...runtime.sequenceProps(id)}>
          <Scene />
        </Sequence>
      );
    })}
  </>
);
