import {C, SANS} from '../../../theme';
import {Backdrop} from '../../../components/Backdrop';
import {CommandLine} from '../StoryPrimitives';
import {Logo} from '../Logo';

export const SceneCTA: React.FC = () => (
  <Backdrop>
    <div
      style={{
        width: 1280,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 34,
        textAlign: 'center',
      }}
    >
      <Logo p={1} />
      <div style={{fontFamily: SANS, fontSize: 86, fontWeight: 700, color: C.white}}>
        cc-insights
      </div>
      <div style={{fontSize: 38, lineHeight: 1.35, color: C.dim}}>
        Root cause, evidence, next command.
      </div>
      <CommandLine>cc-insights rec -p 7d</CommandLine>
      <div style={{fontSize: 28, color: C.dim}}>
        github.com/gqy20/cc-insights · local-first · single binary
      </div>
    </div>
  </Backdrop>
);
