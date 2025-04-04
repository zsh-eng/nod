import { NewPodcastSheet } from '@/components/new-podcast-sheet';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, H2, Paragraph, ScrollView, YStack } from 'tamagui';
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

  const [podcastSheetOpen, setPodcastSheetOpen] = useState(false);

  if (migrationError) {
    console.log('migrationError', {
      migrationError,
    });
    return <Paragraph>Migration error: {migrationError.message}</Paragraph>;
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
    <ScrollView>
      <YStack gap='$4' padding='$4' paddingVertical={'$6'}>
        <H2 fontWeight={'bold'}>Podcasts</H2>

        <YStack gap='$3'>
          <Button onPress={savePodcast} disabled={loading} size='$5'>
            Save Podcast
          </Button>
          <Button onPress={refreshPodcasts} size='$5'>
            Refresh Podcasts
          </Button>
          <Button onPress={() => setPodcastSheetOpen(true)} size='$5'>
            Add Podcast
          </Button>
        </YStack>

        {loading && <ActivityIndicator />}

        {error && <Paragraph color='$red10'>Error: {error}</Paragraph>}

        {saveStatus && <Paragraph>{saveStatus}</Paragraph>}

        {podcasts && <Paragraph>Podcasts: {podcasts.length}</Paragraph>}

        {podcasts && <PodcastList podcasts={podcasts} />}
      </YStack>
      <NewPodcastSheet
        open={podcastSheetOpen}
        onOpenChange={setPodcastSheetOpen}
      />
    </ScrollView>
  );
}
