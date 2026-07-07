import {COLOR, FONT} from '../../palette';
import {TYPE} from '../../typography';

export type FileTreeNode = {
  name: string;
  kind: 'file' | 'folder';
  children?: readonly FileTreeNode[];
  status?: 'added' | 'modified' | 'deleted' | 'tracked' | 'ignored';
};

const STATUS_COLOR: Record<NonNullable<FileTreeNode['status']>, string> = {
  added: COLOR.git.workingTree,
  modified: COLOR.git.head,
  deleted: COLOR.git.conflict,
  tracked: COLOR.text.secondary,
  ignored: COLOR.text.tertiary,
};

const flattenTree = (nodes: readonly FileTreeNode[], depth = 0): Array<FileTreeNode & {depth: number}> =>
  nodes.flatMap((node) => [
    {...node, depth},
    ...(node.children ? flattenTree(node.children, depth + 1) : []),
  ]);

export const FileTree: React.FC<{
  title?: string;
  nodes: readonly FileTreeNode[];
  highlight?: readonly string[];
}> = ({title = 'files', nodes, highlight = []}) => {
  const rows = flattenTree(nodes);

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 14,
        background: COLOR.canvas.raised,
        border: `1px solid ${COLOR.stroke.default}`,
        overflow: 'hidden',
        fontFamily: FONT.mono,
      }}
    >
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          borderBottom: `1px solid ${COLOR.stroke.default}`,
          fontFamily: FONT.sans,
          color: COLOR.text.secondary,
          ...TYPE.codeSmall,
        }}
      >
        {title}
      </div>
      <div style={{padding: '16px 0', ...TYPE.codeSmall}}>
        {rows.map((row) => {
          const active = highlight.includes(row.name);
          const status = row.status ? STATUS_COLOR[row.status] : COLOR.text.secondary;
          return (
            <div
              key={`${row.depth}-${row.name}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr auto',
                alignItems: 'center',
                gap: 10,
                padding: `5px 20px 5px ${20 + row.depth * 28}px`,
                background: active ? COLOR.effects.headHighlight : 'transparent',
                color: active ? COLOR.text.primary : COLOR.text.secondary,
              }}
            >
              <span style={{color: row.kind === 'folder' ? COLOR.git.main : COLOR.text.tertiary}}>
                {row.kind === 'folder' ? 'dir' : 'doc'}
              </span>
              <span>{row.name}</span>
              {row.status ? <span style={{color: status, fontWeight: 760}}>{row.status}</span> : <span />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
