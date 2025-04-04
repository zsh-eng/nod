import { podcastXmlParser } from 'podcast-xml-parser';

export type PodcastFeed = Awaited<ReturnType<typeof podcastXmlParser>>;

export async function parsePodcastFeed(urlString: string): Promise<PodcastFeed> {
  const url = new URL(urlString);
  const feed = await podcastXmlParser(url);
  return feed;
}
