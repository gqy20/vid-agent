export type BrowserRecordingSource = {
  id: string;
  title?: string;
  url?: string;
  src?: string;
  poster?: string;
  metadata?: string;
};

export type BrowserFocusRegion = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  tone?: 'action' | 'approved' | 'merged' | 'warning' | 'failed';
};

export type BrowserRecordingMetadata = {
  recordingId: string;
  focusRegions?: readonly BrowserFocusRegion[];
};
