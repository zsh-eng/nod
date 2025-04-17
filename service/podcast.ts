import { and, eq, inArray } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system';
import db from '../db';
import {
  episodeDownloadsTable,
  episodesTable,
  Podcast,
  podcastsTable,
} from '../db/schema';
import { parsePodcastFeed, PodcastFeed } from '../lib/parser';

const BATCH_SIZE = 100;

/**
 * Adds episodes for a given podcast.
 * On conflict for (guid, podcastid), does nothing.
 */
async function addEpisodes(feed: PodcastFeed, podcast: Podcast) {
  console.log('adding episodes for podcast', podcast.id);
  // Create episodes
  const episodeValues = feed.episodes.map((episode) => ({
    podcastId: podcast.id,
    author: episode.author,
    contentEncoded: episode.contentEncoded,
    description: episode.description,
    enclosureUrl: episode.enclosure?.url,
    enclosureType: episode.enclosure?.type,
    guid: episode.guid,
    itunesAuthor: episode.itunesAuthor,
    itunesDuration: episode.itunesDuration,
    itunesEpisode: episode.itunesEpisode,
    itunesEpisodeType: episode.itunesEpisodeType,
    itunesExplicit: episode.itunesExplicit,
    itunesImage: episode.itunesImage,
    itunesSeason: episode.itunesSeason,
    itunesSubtitle: episode.itunesSubtitle,
    itunesSummary: episode.itunesSummary,
    itunesTitle: episode.itunesTitle,
    link: episode.link,
    pubDate: episode.pubDate,
    pubDateTimestamp: new Date(episode.pubDate),
    title: episode.title,
  }));

  const batches = [];
  for (let i = 0; i < episodeValues.length; i += BATCH_SIZE) {
    batches.push(episodeValues.slice(i, i + BATCH_SIZE));
  }

  console.log(
    'starting iteration over',
    batches.length,
    'batches',
    'for podcast',
    podcast.id
  );
  for (const batch of batches) {
    console.log('inserting batch of', batch.length, 'episodes');
    await db.insert(episodesTable).values(batch).onConflictDoNothing();
    console.log('inserted batch of', batch.length, 'episodes');
  }
  console.log('finished inserting episodes for podcast', podcast.id);
}

export async function createPodcast(feed: PodcastFeed) {
  console.log('creating podcast', feed.podcast.title);
  const { podcast } = feed;

  const [newPodcast] = await db
    .insert(podcastsTable)
    .values({
      copyright: podcast.copyright,
      contentEncoded: podcast.contentEncoded,
      description: podcast.description,
      feedUrl: podcast.feedUrl,
      imageLink: podcast.image?.link,
      imageTitle: podcast.image?.title,
      imageUrl: podcast.image?.url,
      itunesAuthor: podcast.itunesAuthor,
      itunesCategory: podcast.itunesCategory,
      itunesExplicit: podcast.itunesExplicit,
      itunesImage: podcast.itunesImage,
      itunesOwnerName: podcast.itunesOwner?.name,
      itunesOwnerEmail: podcast.itunesOwner?.email,
      itunesSubtitle: podcast.itunesSubtitle,
      itunesSummary: podcast.itunesSummary,
      itunesType: podcast.itunesType,
      language: podcast.language,
      link: podcast.link,
      title: podcast.title,
      nodDateAdded: new Date(),
      nodDateUpdated: new Date(),
    })
    .returning();
  console.log('created podcast', newPodcast.id);

  await addEpisodes(feed, newPodcast);
  return newPodcast;
}

export async function getPodcast(id: number) {
  const podcast = await db.query.podcastsTable.findFirst({
    where: eq(podcastsTable.id, id),
    with: {
      episodes: true,
    },
  });
  return podcast;
}

export async function deletePodcast(id: number) {
  console.log('deleting podcast', id);
  const podcastDownloads = await db
    .select()
    .from(episodeDownloadsTable)
    .leftJoin(
      episodesTable,
      eq(episodeDownloadsTable.episodeId, episodesTable.id)
    )
    .leftJoin(podcastsTable, eq(episodesTable.podcastId, podcastsTable.id))
    .where(and(eq(episodesTable.podcastId, id), eq(podcastsTable.id, id)));

  if (podcastDownloads.length > 0) {
    console.log('found', podcastDownloads.length, 'downloads for podcast', id);
    console.log(
      'podcastDownloads',
      podcastDownloads.map((d) => d.episode_downloads.id)
    );

    for (const download of podcastDownloads) {
      if (!download.episode_downloads.fileUri) {
        continue;
      }

      console.log('deleting download', download.episode_downloads.fileUri);
      await FileSystem.deleteAsync(download.episode_downloads.fileUri);
      console.log('deleted download', download.episode_downloads.fileUri);
    }

    console.log('deleted all downloads for podcast', id);
  }

  const podcastDownloadIds = podcastDownloads.map(
    (d) => d.episode_downloads.id
  );

  // Delete episodes first due to foreign key constraint
  await db.transaction(async (tx) => {
    if (podcastDownloadIds.length > 0) {
      console.log(
        'deleting',
        podcastDownloadIds.length,
        'downloads for podcast',
        id
      );
      await tx
        .delete(episodeDownloadsTable)
        .where(inArray(episodeDownloadsTable.id, podcastDownloadIds));
      console.log(
        'deleted',
        podcastDownloadIds.length,
        'downloads for podcast',
        id
      );
    }

    console.log('deleting episodes for podcast', id);
    await tx.delete(episodesTable).where(eq(episodesTable.podcastId, id));
    console.log('deleted episodes for podcast', id);

    console.log('deleting podcast', id);
    await tx.delete(podcastsTable).where(eq(podcastsTable.id, id));
    console.log('deleted podcast', id);
  });
}

export async function updatePodcastFeed(id: number) {
  const existingPodcast = await getPodcast(id);
  if (!existingPodcast) {
    console.log('podcast not found', id);
    return;
  }

  const parsedPodcast = await parsePodcastFeed(existingPodcast.feedUrl);

  await Promise.all([
    db
      .update(podcastsTable)
      .set({
        nodDateUpdated: new Date(),
      })
      .where(eq(podcastsTable.id, id)),
    addEpisodes(parsedPodcast, existingPodcast),
  ]);

  return;
}

// Episode CRUD operations
export async function getEpisode(id: number) {
  const episode = await db.query.episodesTable.findFirst({
    where: eq(episodesTable.id, id),
  });
  return episode;
}

export async function getEpisodesByPodcastId(podcastId: number) {
  const episodesList = await db.query.episodesTable.findMany({
    where: eq(episodesTable.podcastId, podcastId),
  });
  return episodesList;
}

export async function deleteEpisode(id: number) {
  await db.delete(episodesTable).where(eq(episodesTable.id, id));
}

export async function getPodcasts() {
  const podcastsList = await db.select().from(podcastsTable);
  return podcastsList;
}
