import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { PodcastList } from '../components/podcast-list';
import db from '../db';
import { podcastsTable } from '../db/schema';
import migrations from '../drizzle/migrations';
import { parsePodcastFeed } from '../lib/parser';
import { createPodcast, getPodcasts } from '../service/podcast';

const PODCAST_RSS_FEED_URL = 'https://feeds.simplecast.com/82FI35Px';

export default function Index() {
  const { success, error: migrationError } = useMigrations(db, migrations);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [podcasts, setPodcasts] = useState<
    (typeof podcastsTable.$inferSelect)[] | null
  >(null);

  useEffect(() => {
    if (!success) return;
    (async () => {
      const podcastList = await getPodcasts();
      setPodcasts(podcastList);
    })();
  }, [success]);

  if (migrationError) {
    return <Text>Migration error: {migrationError.message}</Text>;
  }

  async function refreshPodcasts() {
    const podcastList = await getPodcasts();
    setPodcasts(podcastList);
  }

  const savePodcast = async () => {
    try {
      setLoading(true);
      setError(null);
      setSaveStatus(null);

      const feedData = await parsePodcastFeed(PODCAST_RSS_FEED_URL);

      // Check if podcast already exists
      const existingPodcasts = await getPodcasts();
      const exists = existingPodcasts.some(
        (p) => p.title === feedData.podcast.title
      );

      if (exists) {
        setSaveStatus(`${feedData.podcast.title} already exists`);
      } else {
        await createPodcast(feedData);
        setSaveStatus(`${feedData.podcast.title} saved!`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        padding: 16,
        width: '100%',
      }}
    >
      <Button title='Save Podcast' onPress={savePodcast} disabled={loading} />
      <Button title='Refresh Podcasts' onPress={refreshPodcasts} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {error && (
        <Text style={{ color: 'red', marginTop: 20 }}>Error: {error}</Text>
      )}

      {saveStatus && (
        <Text style={{ marginTop: 20, fontSize: 16 }}>{saveStatus}</Text>
      )}

      {podcasts && <Text>Podcasts: {podcasts.length}</Text>}
      {podcasts && <PodcastList podcasts={podcasts} />}
    </View>
  );
}
