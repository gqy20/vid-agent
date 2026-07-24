export type EvidenceIconName =
  | 'route'
  | 'key'
  | 'model'
  | 'menu'
  | 'file'
  | 'shell'
  | 'observe'
  | 'stop'
  | 'permission'
  | 'read'
  | 'edit'
  | 'test'
  | 'graph'
  | 'check';

const IconPaths: React.FC<{name: EvidenceIconName}> = ({name}) => {
  if (name === 'route') return <><circle cx="7" cy="7" r="2.5" /><circle cx="25" cy="25" r="2.5" /><path d="M9.5 7h6.5a4 4 0 0 1 4 4v10a4 4 0 0 0 4 4" /><path d="m20 20 4 5-5 3" /></>;
  if (name === 'key') return <><circle cx="11" cy="16" r="6" /><path d="M17 16h11M24 16v4M20 16v3" /></>;
  if (name === 'model') return <><rect x="7" y="7" width="18" height="18" rx="4" /><path d="M12 3v4M20 3v4M12 25v4M20 25v4M3 12h4M3 20h4M25 12h4M25 20h4" /><circle cx="16" cy="16" r="4" /></>;
  if (name === 'menu') return <><path d="M7 9h18M7 16h18M7 23h18" /><circle cx="4" cy="9" r="1" /><circle cx="4" cy="16" r="1" /><circle cx="4" cy="23" r="1" /></>;
  if (name === 'file') return <><path d="M9 4h10l6 6v18H9z" /><path d="M19 4v7h6M13 17h8M13 22h6" /></>;
  if (name === 'shell') return <><rect x="4" y="6" width="24" height="20" rx="3" /><path d="m9 12 4 4-4 4M16 21h7" /></>;
  if (name === 'observe') return <><path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16Z" /><circle cx="16" cy="16" r="4" /></>;
  if (name === 'stop') return <><circle cx="16" cy="16" r="12" /><rect x="11" y="11" width="10" height="10" rx="1" /></>;
  if (name === 'permission') return <><path d="M16 3 27 7v8c0 7-4.5 11.5-11 14-6.5-2.5-11-7-11-14V7z" /><path d="m11 16 3 3 7-7" /></>;
  if (name === 'read') return <><path d="M5 7h8a5 5 0 0 1 5 5v14H9a4 4 0 0 0-4 3z" /><path d="M27 7h-8a5 5 0 0 0-5 5v14h9a4 4 0 0 1 4 3z" /></>;
  if (name === 'edit') return <><path d="M6 26h6l15-15-6-6L6 20z" /><path d="m18 8 6 6M6 26l2-7 5 5z" /></>;
  if (name === 'test') return <><path d="M11 4h10M14 4v7L7 25a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-7-14V4" /><path d="M10 21h12" /></>;
  if (name === 'graph') return <><circle cx="6" cy="16" r="3" /><circle cx="16" cy="7" r="3" /><circle cx="26" cy="16" r="3" /><circle cx="16" cy="26" r="3" /><path d="m8.5 14 5-5M18.5 9l5 5M23.5 18l-5 6M13.5 24l-5-6" /></>;
  return <><circle cx="16" cy="16" r="12" /><path d="m10 16 4 4 8-9" /></>;
};

export const EvidenceIcon: React.FC<{
  name: EvidenceIconName;
  size?: number;
  tone?: string;
}> = ({name, size = 36, tone = 'currentColor'}) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke={tone}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <IconPaths name={name} />
  </svg>
);
