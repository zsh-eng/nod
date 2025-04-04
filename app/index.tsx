import { useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { parsePodcastFeed, PodcastFeed } from '../lib/parser';

const PODCAST_RSS_FEED_URL = 'https://feeds.simplecast.com/82FI35Px';

export default function Index() {
  const [podcastData, setPodcastData] = useState<PodcastFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPodcastData = async () => {
    try {
      setLoading(true);
      setError(null);
      const feedData = await parsePodcastFeed(PODCAST_RSS_FEED_URL);
      setPodcastData(feedData);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Button
        title='Fetch Podcast Data'
        onPress={fetchPodcastData}
        disabled={loading}
      />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {error && (
        <Text style={{ color: 'red', marginTop: 20 }}>Error: {error}</Text>
      )}

      {podcastData && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            {podcastData.podcast.title}
          </Text>
          <Text style={{ textAlign: 'center' }}>
            {podcastData.podcast.description}
          </Text>
        </View>
      )}
    </View>
  );
}
