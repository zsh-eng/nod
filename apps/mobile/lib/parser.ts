import { podcastXmlParser } from 'podcast-xml-parser';

export type PodcastFeed = Awaited<ReturnType<typeof podcastXmlParser>>;

export async function parsePodcastFeed(
  urlString: string
): Promise<PodcastFeed> {
  console.log('fetching and parsing podcast feed', urlString);
  const url = new URL(urlString);
  const feed = await podcastXmlParser(url);
  console.log('parsed podcast feed', urlString);
  return feed;
}
