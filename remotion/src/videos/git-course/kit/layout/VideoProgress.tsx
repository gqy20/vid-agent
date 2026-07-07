import {COLOR} from '../../palette';

type ProgressScene = {
  id: string;
  title: string;
  duration: number;
};

const getSceneStarts = (scenes: readonly ProgressScene[]) => {
  let cursor = 0;
  return scenes.map((scene) => {
    const start = cursor;
    cursor += scene.duration;
    return {scene, start};
  });
};

export const VideoProgress: React.FC<{
  scenes: readonly ProgressScene[];
  currentFrame: number;
}> = ({scenes, currentFrame}) => {
  const totalFrames = Math.max(
    1,
    scenes.reduce((sum, scene) => sum + scene.duration, 0),
  );
  const progress = Math.min(1, Math.max(0, currentFrame / totalFrames));
  const starts = getSceneStarts(scenes);

  return (
    <div
      data-audit-id="video-progress"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 8,
        zIndex: 60,
        background: 'rgba(199, 206, 197, 0.42)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: COLOR.git.main,
          boxShadow: `0 -1px 0 ${COLOR.canvas.raised}`,
        }}
      />
      {starts.slice(1).map(({scene, start}) => (
        <div
          key={scene.id}
          data-audit-id={`video-progress-tick-${scene.id}`}
          style={{
            position: 'absolute',
            left: `${(start / totalFrames) * 100}%`,
            bottom: 0,
            width: 3,
            height: 16,
            background: COLOR.canvas.raised,
            borderLeft: `1px solid ${COLOR.stroke.default}`,
            borderRight: `1px solid ${COLOR.stroke.default}`,
          }}
        />
      ))}
    </div>
  );
};
