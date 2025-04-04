import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const podcastsTable = sqliteTable('podcasts', {
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
  nodDateUpdated: integer('nod_date_updated', { mode: 'timestamp' }).notNull(),
});

export type Podcast = typeof podcastsTable.$inferSelect;
export type NewPodcast = typeof podcastsTable.$inferInsert;

export const episodesTable = sqliteTable('episodes', {
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
  pubDate: text('pub_date'),
  title: text('title').notNull(),
});

export type Episode = typeof episodesTable.$inferSelect;
export type NewEpisode = typeof episodesTable.$inferInsert;
