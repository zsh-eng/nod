import { EpisodeCard } from '@/components/episode-card';
import { useDownloads } from '@/contexts/download-context';
import db from '@/db';
import { Episode, episodesTable, podcastsTable } from '@/db/schema';
import { useSQLiteQuery } from '@/hooks/use-sqlite-query';
import { stripHtml } from '@/lib/utils';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import { eq } from 'drizzle-orm';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';

import {
    Button,
    H2,
    Paragraph,
    Separator,
    Stack,
    Text,
    View,
    YStack,
} from 'tamagui';

interface PodcastEpisodeListProps {
  podcastId: number;
}

export function PodcastEpisodeList({ podcastId }: PodcastEpisodeListProps) {
  const router = useRouter();

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
    <FlatList
      style={{ paddingHorizontal: 16 }}
      data={episodes || []}
      renderItem={({ item }) => (
        <EpisodeCard episode={item} onPress={() => handleEpisodePress(item)} />
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
  );
}
