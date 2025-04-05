import { NewPodcastSheet } from '@/components/new-podcast-sheet';
import { podcastsTable } from '@/db/schema';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, H2, Paragraph, ScrollView, YStack } from 'tamagui';
import { PodcastList } from '../../../components/podcast-list';
import db from '../../../db';
import migrations from '../../../drizzle/migrations';
import { PodcastFeed } from '../../../lib/parser';
import { createPodcast, getPodcasts } from '../../../service/podcast';

export default function Index() {
  const { success, error: migrationError } = useMigrations(db, migrations);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const { data: podcasts } = useLiveQuery(db.select().from(podcastsTable));

  const [podcastSheetOpen, setPodcastSheetOpen] = useState(false);

  if (migrationError) {
    console.log('migrationError', {
      migrationError,
    });
    return <Paragraph>Migration error: {migrationError.message}</Paragraph>;
  }

  const onAddPodcast = async (podcastFeed: PodcastFeed) => {
    setLoading(true);
    try {
      // Check if podcast already exists
      const existingPodcasts = await getPodcasts();
      const exists = existingPodcasts.some(
        (p) => p.title === podcastFeed.podcast.title
      );

      if (exists) {
        setSaveStatus(`${podcastFeed.podcast.title} already exists`);
      } else {
        await createPodcast(podcastFeed);
        setSaveStatus(`${podcastFeed.podcast.title} saved!`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error saving podcast:', err);
    } finally {
      setPodcastSheetOpen(false);
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <YStack gap='$4' padding='$4' paddingVertical={'$6'}>
        <H2 fontWeight={'bold'}>Podcasts</H2>

        <Button onPress={() => setPodcastSheetOpen(true)} size='$5'>
          Add Podcast
        </Button>

        {loading && <ActivityIndicator />}

        {error && <Paragraph color='$red10'>Error: {error}</Paragraph>}

        {saveStatus && <Paragraph>{saveStatus}</Paragraph>}

        {podcasts && <Paragraph>Podcasts: {podcasts.length}</Paragraph>}

        {podcasts && <PodcastList podcasts={podcasts} />}
      </YStack>

      <NewPodcastSheet
        open={podcastSheetOpen}
        onOpenChange={setPodcastSheetOpen}
        onAddPodcast={onAddPodcast}
        existingPodcasts={podcasts}
        loading={loading}
      />
    </ScrollView>
  );
}
