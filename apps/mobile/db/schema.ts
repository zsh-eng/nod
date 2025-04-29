import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const podcastsTable = sqliteTable(
  'podcasts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    copyright: text('copyright'),
    contentEncoded: text('content_encoded'),
    description: text('description'),

    // To prevent duplicates
    feedUrl: text('feed_url').notNull().unique(),

    imageLink: text('image_link'),
    imageTitle: text('image_title'),
    imageUrl: text('image_url'),
    itunesAuthor: text('itunes_author'),
    itunesCategory: text('itunes_category'),
    itunesExplicit: integer('itunes_explicit', { mode: 'boolean' }),
    itunesImage: text('itunes_image'),
    itunesOwnerName: text('itunes_owner_name'),
    itunesOwnerEmail: text('itunes_owner_email'),
    itunesSubtitle: text('itunes_subtitle'),
    itunesSummary: text('itunes_summary'),
    itunesType: text('itunes_type'),
    language: text('language'),
    link: text('link'),
    title: text('title').notNull(),

    // variables specific to the app
    nodDateAdded: integer('nod_date_added', { mode: 'timestamp' }).notNull(),
    nodDateUpdated: integer('nod_date_updated', {
      mode: 'timestamp',
    }).notNull(),
  },
  (podcastsTable) => ({
    nodDateUpdatedIndex: index('nod_date_updated').on(
      podcastsTable.nodDateUpdated
    ),
  })
);

export type Podcast = typeof podcastsTable.$inferSelect;
export type NewPodcast = typeof podcastsTable.$inferInsert;

export const episodesTable = sqliteTable(
  'episodes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    podcastId: integer('podcast_id').references(() => podcastsTable.id),
    author: text('author'),
    contentEncoded: text('content_encoded'),
    description: text('description'),
    enclosureUrl: text('enclosure_url'),
    enclosureType: text('enclosure_type'),
    guid: text('guid').notNull(),
    itunesAuthor: text('itunes_author'),
    itunesDuration: real('itunes_duration'),
    itunesEpisode: integer('itunes_episode'),
    itunesEpisodeType: text('itunes_episode_type'),
    itunesExplicit: integer('itunes_explicit', { mode: 'boolean' }),
    itunesImage: text('itunes_image'),
    itunesSeason: integer('itunes_season'),
    itunesSubtitle: text('itunes_subtitle'),
    itunesSummary: text('itunes_summary'),
    itunesTitle: text('itunes_title'),
    link: text('link'),
    pubDate: text('pub_date').notNull(),
    title: text('title').notNull(),
    // pubDate is just a string from the RSS feed
    // we need a separate column to store the unix timestamp
    // for sorting the episodes
    pubDateTimestamp: integer('pub_date_timestamp', {
      mode: 'timestamp',
    }).notNull(),
  },
  (episodesTable) => ({
    // currently the only index we have is by timestamp
    // because only the inbox needs this sorting
    // TODO: we need to add podcastId, timestamp index
    // if we want to refresh podcasts
    // currently the order is ok
    pubDateTimestampIndex: index('pub_date_timestamp').on(
      episodesTable.pubDateTimestamp
    ),
    // combination of podcastId and guid should be unique
    uniqueGuidIndex: uniqueIndex('unique_guid').on(
      episodesTable.podcastId,
      episodesTable.guid
    ),
  })
);

export type Episode = typeof episodesTable.$inferSelect;
export type NewEpisode = typeof episodesTable.$inferInsert;

export const episodeDownloadsTable = sqliteTable('episode_downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episodeId: integer('episode_id')
    .notNull()
    .references(() => episodesTable.id)
    .unique(),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'paused', 'completed'],
  }).notNull(),
  currentBytes: integer('current_bytes').notNull(),
  totalBytes: integer('total_bytes').notNull(),
  fileUri: text('file_uri').notNull(),
  lastActivityAt: integer('last_activity_at', { mode: 'timestamp' }).notNull(),
  downloadHandle: text('download_handle').notNull(), // Will store JSON string
});

export type EpisodeDownload = typeof episodeDownloadsTable.$inferSelect;
export type NewEpisodeDownload = typeof episodeDownloadsTable.$inferInsert;

export const podcastEpisodeRelations = relations(podcastsTable, ({ many }) => ({
  episodes: many(episodesTable),
}));

export const episodePodcastRelations = relations(episodesTable, ({ one }) => ({
  podcast: one(podcastsTable, {
    fields: [episodesTable.podcastId],
    references: [podcastsTable.id],
  }),
  episodeDownloads: one(episodeDownloadsTable, {
    fields: [episodesTable.id],
    references: [episodeDownloadsTable.episodeId],
  }),
}));

export const episodeDownloadRelations = relations(
  episodeDownloadsTable,
  ({ one }) => ({
    episode: one(episodesTable, {
      fields: [episodeDownloadsTable.episodeId],
      references: [episodesTable.id],
    }),
  })
);
