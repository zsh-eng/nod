import { EpisodeCard } from '@/components/episode-card';
import { PodcastActionsSheet } from '@/components/podcast-actions-sheet';
import { useDownloads } from '@/contexts/download-context';
import db from '@/db';
import { Episode, episodesTable, podcastsTable } from '@/db/schema';
import { useSQLiteQuery } from '@/hooks/use-sqlite-query';
import { stripHtml } from '@/lib/utils';
import { deletePodcast } from '@/service/podcast';
import { ArrowLeft, EllipsisVertical, X } from '@tamagui/lucide-icons';
import { eq } from 'drizzle-orm';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList } from 'react-native';

import {
  Button,
  H2,
  Paragraph,
  Separator,
  Stack,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui';

export default function PodcastPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const podcastId = parseInt(id, 10);
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);

  const {
    data: podcast,
    loading: podcastLoading,
    error: podcastError,
  } = useSQLiteQuery(() =>
    db.query.podcastsTable.findFirst({
      where: eq(podcastsTable.id, podcastId),
    })
  );

  const { data: episodes, loading: episodesLoading } = useSQLiteQuery(() =>
    db.query.episodesTable.findMany({
      where: eq(episodesTable.podcastId, podcastId),
      limit: 100,
    })
  );

  const { startDownload } = useDownloads();

  const handleEpisodePress = (episode: Episode) => {
    startDownload(episode);
  };

  if (podcastError) {
    return (
      <YStack
        flex={1}
        justifyContent='center'
        alignItems='center'
        padding='$4'
        gap='$4'
      >
        <X size={48} color='gray' />
        <H2>Podcast not found</H2>
        <Paragraph textAlign='center' color='gray'>
          The podcast you're looking for doesn't exist or has been removed.
        </Paragraph>
        <Button icon={ArrowLeft} onPress={() => router.back()} theme='active'>
          Go Back
        </Button>
      </YStack>
    );
  }

  if (!podcast) {
    return null;
  }

  const getHeader = () => {
    return (
      <YStack gap='$4'>
        {podcast.imageUrl && (
          <Stack
            aspectRatio={1}
            width='100%'
            borderRadius={'$4'}
            overflow='hidden'
          >
            <Image
              source={{ uri: podcast.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit='cover'
            />
          </Stack>
        )}

        <YStack gap='$2'>
          <Text fontSize='$9' fontWeight='bold'>
            {podcast.title}
          </Text>
          {podcast.itunesAuthor && (
            <Text color='' fontSize='$5'>
              {podcast.itunesAuthor}
            </Text>
          )}
          {podcast.description && (
            <Paragraph color='gray' fontSize='$5'>
              {stripHtml(podcast.description)}
            </Paragraph>
          )}

          <Text
            fontSize='$7'
            fontWeight='bold'
            marginTop='$4'
            marginBottom='$2'
          >
            Episodes
          </Text>
        </YStack>
      </YStack>
    );
  };

  return (
    <YStack gap='$2' paddingBottom='$10'>
      <XStack marginLeft='$2' marginTop='$2' justifyContent='space-between'>
        <Button
          backgroundColor='transparent'
          onPress={() => router.back()}
          theme='active'
          width='$4'
          hitSlop={10}
        >
          <ArrowLeft size={28} color='gray' />
        </Button>

        <Button
          backgroundColor='transparent'
          onPress={() => setActionsSheetOpen(true)}
          theme='active'
          width='$4'
          hitSlop={10}
        >
          <EllipsisVertical size={28} color='gray' />
        </Button>
      </XStack>

      <FlatList
        style={{ paddingHorizontal: 16 }}
        data={episodes || []}
        renderItem={({ item }) => (
          <EpisodeCard
            episode={item}
            onPress={() => handleEpisodePress(item)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => (
          <Separator
            borderColor='rgba(0, 0, 0, 0.1)'
            borderWidth={0.5}
            marginVertical='$4'
          />
        )}
        ListHeaderComponent={getHeader}
        ListFooterComponent={() => <View height={32} />}
      />

      <PodcastActionsSheet
        open={actionsSheetOpen}
        onOpenChange={setActionsSheetOpen}
        onDeletePodcast={async () => {
          await deletePodcast(podcastId);
          router.back();
        }}
      />
    </YStack>
  );
}
