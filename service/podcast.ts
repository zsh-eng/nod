import { eq } from 'drizzle-orm';
import db from '../db';
import { episodesTable, podcastsTable } from '../db/schema';
import { PodcastFeed } from '../lib/parser';

export async function createPodcast(feed: PodcastFeed) {
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

  // Create episodes
  const episodeValues = feed.episodes.map((episode) => ({
    podcastId: newPodcast.id,
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
    title: episode.title,
  }));

  await db.insert(episodesTable).values(episodeValues);

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

export async function updatePodcast(id: number, feed: PodcastFeed) {
  const { podcast } = feed;

  const [updatedPodcast] = await db
    .update(podcastsTable)
    .set({
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
      nodDateUpdated: new Date(),
    })
    .where(eq(podcastsTable.id, id))
    .returning();

  // Delete existing episodes
  await db.delete(episodesTable).where(eq(episodesTable.podcastId, id));

  // Create new episodes
  const episodeValues = feed.episodes.map((episode) => ({
    podcastId: id,
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
    title: episode.title,
  }));

  await db.insert(episodesTable).values(episodeValues);

  return updatedPodcast;
}

export async function deletePodcast(id: number) {
  // Delete episodes first due to foreign key constraint
  await db.delete(episodesTable).where(eq(episodesTable.podcastId, id));
  await db.delete(podcastsTable).where(eq(podcastsTable.id, id));
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
