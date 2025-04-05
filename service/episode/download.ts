import db from '@/db';
import { Episode, episodeDownloadsTable } from '@/db/schema';
import {
  AppEpisodeDownload,
  isCompletedDownload,
  isInProgressDownload,
  isNotStartedDownload,
  isPausedDownload,
  NotStartedDownload,
} from '@/types/episode';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system';

export type DownloadActionResponse =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export const EPISODE_HAS_NO_DOWNLOAD_URL_ERROR = 'Episode has no download URL';

function getFileExtensionFromUrl(enclosureUrl: string) {
  const filename = enclosureUrl.split('/').pop();
  if (!filename) {
    throw new Error('Episode has no filename');
  }

  const extension = filename.split('.').pop();
  return extension;
}

/**
 * Constructs a filename for a download.
 * Filename format: dir/episodeId.extension
 */
export function constructDownloadFilename(dir: string, episode: Episode) {
  if (!episode.enclosureUrl) {
    throw new Error('Episode has no enclosure URL');
  }

  const extension = getFileExtensionFromUrl(episode.enclosureUrl);
  return `${dir}/${episode.id}.${extension}`;
}

/**
 * Persists the download state of an episode to the database.
 */
export async function updateDownloadState(download: AppEpisodeDownload) {
  if (isCompletedDownload(download)) {
    await db
      .update(episodeDownloadsTable)
      .set({
        status: 'completed',
        fileUri: download.fileUri,
        currentBytes: download.totalBytes,
        totalBytes: download.totalBytes,
        lastActivityAt: new Date(),
        downloadHandle: JSON.stringify({}),
      })
      .where(eq(episodeDownloadsTable.episodeId, download.episodeId));
    console.log('Updated download state to completed', {
      episodeId: download.episodeId,
    });
    return;
  }

  if (isInProgressDownload(download)) {
    await db
      .update(episodeDownloadsTable)
      .set({
        status: 'in_progress',
        fileUri: download.fileUri,
        currentBytes: download.currentBytes,
        totalBytes: download.totalBytes,
        lastActivityAt: new Date(),
        downloadHandle: JSON.stringify(download.downloadHandle),
      })
      .where(eq(episodeDownloadsTable.episodeId, download.episodeId));
    console.log('Updated download state to in progress', {
      episodeId: download.episodeId,
    });
    return;
  }

  if (isPausedDownload(download)) {
    await db
      .update(episodeDownloadsTable)
      .set({
        status: 'paused',
        fileUri: download.fileUri,
        currentBytes: download.currentBytes,
        totalBytes: download.totalBytes,
        lastActivityAt: new Date(),
        downloadHandle: JSON.stringify(download.downloadHandle),
      })
      .where(eq(episodeDownloadsTable.episodeId, download.episodeId));
    console.log('Updated download state to paused', {
      episodeId: download.episodeId,
    });
    return;
  }

  if (isNotStartedDownload(download)) {
    throw new Error('Should not be updating not started download state');
  }

  throw new Error('Invalid episode download state', { cause: download });
}

type CreateDownloadStateResult =
  | {
      success: true;
      downloadState: NotStartedDownload;
    }
  | {
      success: false;
      error: string;
    };

export async function createDownloadState(
  episode: Episode,
  fileUri: string
): Promise<CreateDownloadStateResult> {
  try {
    const [result] = await db
      .insert(episodeDownloadsTable)
      .values({
        episodeId: episode.id,
        status: 'not_started',
        currentBytes: 0,
        totalBytes: 0,
        fileUri,
        lastActivityAt: new Date(),
        downloadHandle: JSON.stringify({}),
      })
      .returning();

    if (!result) {
      console.error('Failed to create download state', {
        episodeId: episode.id,
      });

      return {
        success: false,
        error: 'Failed to create download state',
      };
    }

    console.log('Created download state', {
      episodeId: episode.id,
      downloadState: result,
    });
    return {
      success: true,
      downloadState: {
        id: result.id,
        episodeId: result.episodeId,
        status: 'not_started',
        fileUri: result.fileUri,
      },
    };
  } catch (error) {
    console.error('Failed to create download state', {
      episodeId: episode.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function cancelDownload(episodeId: number) {
  const download = await db.query.episodeDownloadsTable.findFirst({
    where: eq(episodeDownloadsTable.episodeId, episodeId),
  });

  if (!download) {
    console.error('Download not found', {
      episodeId,
    });
    return;
  }

  if (download.status === 'completed') {
    console.error('Download is completed', {
      episodeId,
    });
    return;
  }

  console.log('Cancelling download', {
    episodeId,
  });
  await db
    .delete(episodeDownloadsTable)
    .where(eq(episodeDownloadsTable.id, download.id));
  console.log('Download cancelled', {
    episodeId,
  });
}

export async function deleteDownload(episodeId: number) {
  const existingDownload = await db.query.episodeDownloadsTable.findFirst({
    where: eq(episodeDownloadsTable.episodeId, episodeId),
  });

  if (!existingDownload) {
    console.log('Download not found', { episodeId });
    return;
  }

  const hasDownloadFile = await FileSystem.getInfoAsync(
    existingDownload.fileUri
  );

  if (hasDownloadFile.exists) {
    console.log('Deleting download file', {
      episodeId,
      fileUri: existingDownload.fileUri,
    });
    await FileSystem.deleteAsync(existingDownload.fileUri);
    console.log('Download file deleted', {
      episodeId,
      fileUri: existingDownload.fileUri,
    });
  }

  console.log('Removing download from database', {
    episodeId,
  });
  await db
    .delete(episodeDownloadsTable)
    .where(eq(episodeDownloadsTable.episodeId, episodeId));
  console.log('Download removed from database', {
    episodeId,
  });
}
