import {COLOR, FONT, WEIGHT} from '../../palette';
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
        borderRadius: 8,
        background: 'rgba(255,255,255,0.68)',
        border: `1px solid ${COLOR.stroke.soft}`,
        overflow: 'hidden',
        fontFamily: FONT.mono,
        boxShadow: `0 12px 32px ${COLOR.effects.shadowSoft}`,
      }}
    >
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          borderBottom: `1px solid ${COLOR.stroke.soft}`,
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
                gridTemplateColumns: '44px minmax(0, 1fr) auto',
                alignItems: 'center',
                columnGap: 12,
                padding: `5px 20px 5px ${20 + row.depth * 28}px`,
                background: active ? COLOR.effects.headHighlight : 'transparent',
                color: active ? COLOR.text.primary : COLOR.text.secondary,
                borderLeft: active ? `3px solid ${COLOR.git.head}` : '3px solid transparent',
              }}
            >
              <span style={{color: row.kind === 'folder' ? COLOR.git.main : COLOR.text.tertiary, fontWeight: WEIGHT.bold}}>
                {row.kind === 'folder' ? 'dir' : 'blob'}
              </span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{row.name}</span>
              {row.status ? <span style={{color: status, fontWeight: WEIGHT.bold}}>{row.status}</span> : <span />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
