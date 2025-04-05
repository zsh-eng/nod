import {
  constructDownloadFilename,
  EPISODE_HAS_NO_DOWNLOAD_URL_ERROR,
} from '@/service/episode/download';
import * as FileSystem from 'expo-file-system';
import {
  type DownloadProgressData,
  type DownloadResumable,
} from 'expo-file-system';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { Episode } from '../db/schema';

type DownloadStatus = 'not_started' | 'in_progress' | 'paused' | 'completed';

interface DownloadState {
  status: DownloadStatus;
  progress: number;
  totalBytes: number;
  currentBytes: number;
  resumable?: DownloadResumable;
}

interface DownloadContextType {
  activeDownloads: Record<number, DownloadState>;
  startDownload: (episode: Episode) => Promise<void>;
  pauseDownload: (episodeId: number) => Promise<void>;
  cancelDownload: (episodeId: number) => Promise<void>;
}

const DownloadContext = createContext<DownloadContextType | null>(null);

const NEW_DOWNLOAD: DownloadState = {
  status: 'in_progress',
  progress: 0,
  totalBytes: 0,
  currentBytes: 0,
};

const EPISODE_DOWNLOADS_DIR =
  FileSystem.documentDirectory + 'episode-downloads/';

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [activeDownloads, setActiveDownloads] = useState<
    Record<number, DownloadState>
  >({});

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
  const buildDownloadCallback = (episodeId: number) => {
    return (progress: DownloadProgressData) => {
      setActiveDownloads((prev) => {
        if (!prev[episodeId]) {
          return prev;
        }

        const isCompleted =
          progress.totalBytesWritten === progress.totalBytesExpectedToWrite;

        if (isCompleted) {
          return {
            ...prev,
            [episodeId]: {
              ...prev[episodeId],
              status: 'completed',
              totalBytes: progress.totalBytesExpectedToWrite,
              currentBytes: progress.totalBytesWritten,
              resumable: undefined,
            },
          };
        }

        const next = {
          ...prev[episodeId],
          progress:
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite,
          totalBytes: progress.totalBytesExpectedToWrite,
          currentBytes: progress.totalBytesWritten,
        };

        return {
          ...prev,
          [episodeId]: next,
        };
      });
    };
  };

  const startDownload = useCallback(async (episode: Episode) => {
    if (!episode.enclosureUrl) {
      console.error(EPISODE_HAS_NO_DOWNLOAD_URL_ERROR);
      return;
    }

    try {
      const callback = buildDownloadCallback(episode.id);
      const downloadResumable = FileSystem.createDownloadResumable(
        episode.enclosureUrl,
        constructDownloadFilename(EPISODE_DOWNLOADS_DIR, episode),
        {},
        callback
      );

      // Optimistically start the download
      setActiveDownloads((prev) => {
        return {
          ...prev,
          [episode.id]: {
            ...NEW_DOWNLOAD,
            resumable: downloadResumable,
          },
        };
      });

      // We don't await this, just let the callback handle the state updates
      downloadResumable.downloadAsync();
    } catch (error) {
      console.error('Error starting download for episode:', episode.id, error);
    }
  }, []);

  const pauseDownload = useCallback(
    async (episodeId: number) => {
      console.log('Pausing download for episode:', episodeId);

      try {
        const download = activeDownloads[episodeId];
        const isInProgress = download?.status === 'in_progress';
        if (!isInProgress) {
          console.log('Download is not in progress, skipping pause');
          return;
        }

        if (!download?.resumable) {
          console.log('Download does not have a resumable, skipping pause');
          return;
        }

        await download.resumable.pauseAsync();
        setActiveDownloads((prev) => {
          return {
            ...prev,
            [episodeId]: {
              ...prev[episodeId],
              status: 'paused',
            },
          };
        });
      } catch (error) {
        console.error('Error pausing download:', error);
      }
    },
    [activeDownloads]
  );

  const cancelDownload = useCallback(
    async (episodeId: number) => {
      console.log('Canceling download for episode:', episodeId);

      try {
        const download = activeDownloads[episodeId];
        if (!download) {
          console.log('Download does not exist, skipping cancel');
          return;
        }

        // Assuming that we can cancel either when it's paused or in progress
        if (!download?.resumable) {
          console.log('Download does not have a resumable, skipping cancel');
          return;
        }

        // Try to cancel the download if possible
        try {
          await download.resumable.cancelAsync();
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
    },
    [activeDownloads]
  );

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
