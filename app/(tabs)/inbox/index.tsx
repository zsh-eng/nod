import { EpisodeCard } from '@/components/episode-card';
import db from '@/db';
import {
  episodeDownloadsTable,
  episodesTable,
  podcastsTable,
} from '@/db/schema';
import { useSQLiteQuery } from '@/hooks/use-sqlite-query';
import { desc, eq } from 'drizzle-orm';
import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { H2, Paragraph, Separator, View, YStack } from 'tamagui';

export default function Inbox() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: episodes,
    loading: episodeLoading,
    error: episodeError,
    refetch: refetchEpisodes,
  } = useSQLiteQuery(() =>
    db
      .select()
      .from(episodesTable)
      .orderBy(desc(episodesTable.pubDateTimestamp))
      .limit(100)
      .leftJoin(podcastsTable, eq(episodesTable.podcastId, podcastsTable.id))
      .leftJoin(
        episodeDownloadsTable,
        eq(episodesTable.id, episodeDownloadsTable.episodeId)
      )
  );

  if (episodeError) {
    return (
      <YStack gap='$2' paddingBottom='$10' backgroundColor={'$background'}>
        <Paragraph>Failed to load episodes: {episodeError.message}</Paragraph>
      </YStack>
    );
  }

  if (episodeLoading || !episodes) {
    return (
      <YStack gap='$2' paddingBottom='$10' backgroundColor={'$background'}>
        <Paragraph>Loading episodes...</Paragraph>
      </YStack>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchEpisodes();
    setRefreshing(false);
  };

  return (
    <YStack gap='$2' paddingBottom='$10' backgroundColor={'$background'}>
      <YStack gap='$4' padding='$4' paddingVertical={'$6'}>
        <H2 fontWeight={'bold'}>Inbox</H2>
      </YStack>

      <FlatList
        style={{ paddingHorizontal: 16 }}
        data={episodes}
        renderItem={({ item }) => (
          <EpisodeCard
            key={item.episodes.id.toString()}
            episode={item.episodes}
            onPress={() => {}}
            downloadStatus={item.episode_downloads?.status}
          />
        )}
        keyExtractor={(item) => item.episodes.id.toString()}
        ItemSeparatorComponent={() => (
          <Separator
            borderColor='rgba(0, 0, 0, 0.1)'
            borderWidth={0.5}
            marginVertical='$4'
          />
        )}
        ListFooterComponent={() => <View height={32} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </YStack>
  );
}
