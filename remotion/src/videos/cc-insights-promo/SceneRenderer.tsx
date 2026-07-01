import type {SceneId} from './timeline';
import {SceneBrand} from './scenes/SceneBrand';
import {SceneCTA} from './scenes/SceneCTA';
import {SceneCmd} from './scenes/SceneCmd';
import {SceneFeatures} from './scenes/SceneFeatures';
import {SceneHook} from './scenes/SceneHook';
import {SceneRec} from './scenes/SceneRec';
import {SceneTok} from './scenes/SceneTok';
import {SceneWeb} from './scenes/SceneWeb';

export const SceneRenderer: React.FC<{id: SceneId}> = ({id}) => {
  switch (id) {
    case 'hook':
      return <SceneHook />;
    case 'brand':
      return <SceneBrand />;
    case 'rec':
      return <SceneRec />;
    case 'tok':
      return <SceneTok />;
    case 'cmd':
      return <SceneCmd />;
    case 'web':
      return <SceneWeb />;
    case 'features':
      return <SceneFeatures />;
    case 'cta':
      return <SceneCTA />;
  }
};
