import type {SceneId} from './timeline';
import {SceneBrand} from './scenes/SceneBrand';
import {SceneCTA} from './scenes/SceneCTA';
import {SceneFuture} from './scenes/SceneFuture';
import {SceneHook} from './scenes/SceneHook';
import {SceneMap} from './scenes/SceneMap';
import {SceneSimulator} from './scenes/SceneSimulator';

export const SceneRenderer: React.FC<{id: SceneId}> = ({id}) => {
  switch (id) {
    case 'hook':
      return <SceneHook />;
    case 'brand':
      return <SceneBrand />;
    case 'map':
      return <SceneMap />;
    case 'future':
      return <SceneFuture />;
    case 'simulator':
      return <SceneSimulator />;
    case 'cta':
      return <SceneCTA />;
  }
};
