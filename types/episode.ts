import { DownloadResumable } from 'expo-file-system';

type BaseDownload = {
  id: number;
  episodeId: number;
  lastActivityAt: Date;
};

export type NotStartedDownload = BaseDownload & {
  status: 'not_started';
};

export type InProgressDownload = BaseDownload & {
  status: 'in_progress';
  downloadHandle: DownloadResumable;
  currentBytes: number;
  totalBytes: number;
};

export type PausedDownload = BaseDownload & {
  status: 'paused';
  downloadHandle: DownloadResumable;
  currentBytes: number;
  totalBytes: number;
};

export type CompletedDownload = BaseDownload & {
  status: 'completed';
  fileUri: string;
  totalBytes: number;
};

export type AppEpisodeDownload =
  | NotStartedDownload
  | InProgressDownload
  | PausedDownload
  | CompletedDownload;

// Helper type guards
export const isNotStartedDownload = (
  download: AppEpisodeDownload
): download is NotStartedDownload => download.status === 'not_started';

export const isInProgressDownload = (
  download: AppEpisodeDownload
): download is InProgressDownload => download.status === 'in_progress';

export const isPausedDownload = (
  download: AppEpisodeDownload
): download is PausedDownload => download.status === 'paused';

export const isCompletedDownload = (
  download: AppEpisodeDownload
): download is CompletedDownload => download.status === 'completed';
