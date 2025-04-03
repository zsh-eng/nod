import pt from 'podcast-partytime';

export async function getFeedObject(podcastRssFeedUrl: string) {
  console.log('Fetching feed URL', podcastRssFeedUrl);
  const text = await fetch(podcastRssFeedUrl).then((res) => res.text());

  console.log('Fetched feed URL', text.slice(0, 50));
  const feed = pt.parseFeed(text);

  console.log('Parsed feed', feed);
  return feed;
}


