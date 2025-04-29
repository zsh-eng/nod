import db from '@/db';
import {
  constructDownloadFilename,
  createDownloadState,
  DownloadActionResponse,
  EPISODE_HAS_NO_DOWNLOAD_URL_ERROR,
  updateDownloadState,
} from '@/service/episode/download';
import {
  AppEpisodeDownload,
  CompletedDownload,
  InProgressDownload,
  isInProgressDownload,
  PausedDownload,
} from '@/types/episode';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system';
import { type DownloadProgressData, DownloadResumable } from 'expo-file-system';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Episode, episodeDownloadsTable } from '../db/schema';

export interface DownloadState {
  episode: Episode;
  download: AppEpisodeDownload;
  resumable?: DownloadResumable;
}

interface DownloadContextType {
  activeDownloads: Record<number, DownloadState>;
  startDownload: (episode: Episode) => Promise<DownloadActionResponse>;
  pauseDownload: (episodeId: number) => Promise<void>;
  cancelDownload: (episodeId: number) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | null>(null);

const EPISODE_DOWNLOADS_DIR =
  FileSystem.documentDirectory + 'episode-downloads/';

function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [activeDownloads, setActiveDownloads] = useState<
    Record<number, DownloadState>
  >({});
  const activeDownloadsRef = useRef(activeDownloads);

  useEffect(() => {
    activeDownloadsRef.current = activeDownloads;
  }, [activeDownloads]);

  /**
   * Builds a callback function that updates the download state for a given episode.
   *
   * The callback function handles the updating of the state to 'completed'.
   *
   * I prefer this approach to attempting to detect the error in the
   * `await downloadResumable.downloadAsync()` call for pauses.
   *
   * Assumption: Expo will always make a final call to the callback function when the progress completes.
   * AND that it doesn't make another call after `pause` is called (this might trigger race condition
   * of -> pause -> progress update)
   */
  const buildDownloadCallback = useCallback((episodeId: number) => {
    // We want to make sure that regular progress updates are throttled
    // but not the final update that marks the download as completed
    const throttledProgressUpdate = throttle(
      (progress: DownloadProgressData) => {
        // Handle regular progress updates
        if (!activeDownloadsRef.current) {
          return;
        }

        const downloadState = activeDownloadsRef.current[episodeId];
        if (
          !downloadState ||
          !isInProgressDownload(downloadState.download) ||
          !downloadState.resumable
        ) {
          return;
        }

        setActiveDownloads((prev) => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            download: {
              ...downloadState.download,
              currentBytes: progress.totalBytesWritten,
              totalBytes: progress.totalBytesExpectedToWrite,
            } as InProgressDownload,
          },
        }));
      },
      500
    );

    return (progress: DownloadProgressData) => {
      if (!activeDownloadsRef.current) {
        console.log('No active downloads, skipping progress update');
        return;
      }

      console.log('Received progress for episode:', episodeId, progress);
      const downloadState = activeDownloadsRef.current[episodeId];
      if (!downloadState) {
        console.log('No download state found for episode:', episodeId);
        return;
      }

      if (!isInProgressDownload(downloadState.download)) {
        console.log('Download is not in progress, skipping progress update');
        return;
      }

      if (!downloadState.resumable) {
        console.log(
          'Download does not have a resumable, skipping progress update'
        );
        return;
      }

      const isCompleted =
        progress.totalBytesWritten === progress.totalBytesExpectedToWrite;

      if (isCompleted) {
        // Handle completion immediately without throttling
        const nextDownloadState = {
          ...downloadState.download,
          status: 'completed',
          totalBytes: progress.totalBytesExpectedToWrite,
        } as CompletedDownload;

        console.log('Download completed for episode:', episodeId);

        setActiveDownloads((prev) => {
          const { [episodeId]: _, ...rest } = prev;
          return rest;
        });
        updateDownloadState(nextDownloadState);
      } else {
        // Use throttled handler for progress updates
        console.log(
          'Updating progress for episode:',
          episodeId,
          `(${progress.totalBytesWritten} / ${progress.totalBytesExpectedToWrite})`
        );
        throttledProgressUpdate(progress);
      }
    };
  }, []);

  const startDownload = useCallback(
    async (episode: Episode): Promise<DownloadActionResponse> => {
      if (!episode.enclosureUrl) {
        console.error(EPISODE_HAS_NO_DOWNLOAD_URL_ERROR);
        return {
          success: false,
          error: EPISODE_HAS_NO_DOWNLOAD_URL_ERROR,
        };
      }

      try {
        // Check if URL is valid and accessible
        console.log('Checking URL before download:', episode.enclosureUrl);

        // Make sure directory exists
        const dirInfo = await FileSystem.getInfoAsync(EPISODE_DOWNLOADS_DIR);
        if (!dirInfo.exists) {
          console.log('Creating directory on demand:', EPISODE_DOWNLOADS_DIR);
          await FileSystem.makeDirectoryAsync(EPISODE_DOWNLOADS_DIR, {
            intermediates: true,
          });
        }

        // Check if the download already exists
        const download = await db.query.episodeDownloadsTable.findFirst({
          where: eq(episodeDownloadsTable.episodeId, episode.id),
        });
        if (download) {
          console.log('Download already exists, skipping');
          return {
            success: true,
          };
        }

        // Build filename
        const localUri = constructDownloadFilename(
          EPISODE_DOWNLOADS_DIR,
          episode
        );
        console.log('Local download URI will be:', localUri);

        // Create callback function
        const callback = buildDownloadCallback(episode.id);
        console.log('Created download callback for episode:', episode.id);

        // Create download resumable
        console.log('Creating download resumable for:', episode.enclosureUrl);
        const downloadResumable = FileSystem.createDownloadResumable(
          episode.enclosureUrl,
          localUri,
          {},
          callback
        );

        console.log('Creating download state for episode:', episode.id);
        const createDownloadStateResult = await createDownloadState(
          episode,
          localUri
        );
        if (!createDownloadStateResult.success) {
          console.error('Failed to create download state', {
            episodeId: episode.id,
            error: createDownloadStateResult.error,
          });

          return createDownloadStateResult;
        }

        // TODO: handle multiple downloads properly
        // we might want to queue not started first, then eventualy
        // start the download later using some kind of rate limiter logic
        const inProgressDownload: InProgressDownload = {
          ...createDownloadStateResult.downloadState,
          status: 'in_progress',
          downloadHandle: downloadResumable,
          currentBytes: 0,
          totalBytes: 0,
        };

        console.log(
          'Updating download state to in_progress for episode:',
          episode.id
        );
        updateDownloadState(inProgressDownload);

        console.log('Starting download for episode:', episode.id);
        // Optimistically start the download
        setActiveDownloads((prev) => {
          return {
            ...prev,
            [episode.id]: {
              episode,
              download: inProgressDownload,
              resumable: downloadResumable,
            },
          };
        });

        // We don't await this, just let the callback handle the state updates
        downloadResumable.downloadAsync();
        console.log('Download started for episode:', episode.id);

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          'Error starting download for episode:',
          episode.id,
          error
        );

        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error starting download',
        };
      }
    },
    []
  );

  const pauseDownload = useCallback(async (episodeId: number) => {
    if (!activeDownloadsRef.current) {
      console.log('No active downloads, skipping pause');
      return;
    }

    console.log('Pausing download for episode:', episodeId);
    try {
      const download = activeDownloadsRef.current[episodeId];
      if (!download || !isInProgressDownload(download.download)) {
        console.log('Download is not in progress, skipping pause');
        return;
      }

      if (!download.resumable) {
        console.log('Download does not have a resumable, skipping pause');
        return;
      }

      await download.resumable.pauseAsync();
      const pausedDownload: PausedDownload = {
        id: download.download.id,
        episodeId: download.download.episodeId,
        fileUri: download.download.fileUri,
        status: 'paused',
        downloadHandle: download.resumable,
        currentBytes: download.download.currentBytes,
        totalBytes: download.download.totalBytes,
      };

      console.log('Paused download for episode:', episodeId);
      setActiveDownloads((prev) => {
        const { [episodeId]: _, ...rest } = prev;
        return rest;
      });
      updateDownloadState(pausedDownload);
    } catch (error) {
      console.error('Error pausing download:', error);
    }
  }, []);

  const cancelDownload = useCallback(async (episodeId: number) => {
    if (!activeDownloadsRef.current) {
      console.log('No active downloads, skipping cancel');
      return;
    }
    console.log('Canceling download for episode:', episodeId);

    try {
      const download = activeDownloadsRef.current[episodeId];
      if (!download) {
        console.log('Download does not exist, skipping cancel');
        return;
      }

      // Assuming that we can cancel either when it's paused or in progress
      if (!download.resumable) {
        console.log('Download does not have a resumable, skipping cancel');
        return;
      }

      // Try to cancel the download if possible
      try {
        await Promise.all([
          download.resumable.cancelAsync(),
          cancelDownload(episodeId),
        ]);
      } catch (e) {
        console.log('Error canceling download, removing anyway:', e);
      }

      setActiveDownloads((prev) => {
        const { [episodeId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Error canceling download:', error);
    }
  }, []);

  return (
    <DownloadContext.Provider
      value={{
        activeDownloads,
        startDownload,
        pauseDownload,
        cancelDownload,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownloads() {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownloads must be used within a DownloadProvider');
  }
  return context;
}
