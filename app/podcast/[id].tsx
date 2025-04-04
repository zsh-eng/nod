import db from '@/db';
import { episodesTable, podcastsTable } from '@/db/schema';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Button,
    H2,
    Paragraph,
    ScrollView,
    Stack,
    Text,
    XStack,
    YStack,
} from 'tamagui';

export default function PodcastPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const podcastId = parseInt(id, 10);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: podcastWithEpisodes } = useLiveQuery(
    db
      .select({
        podcast: podcastsTable,
        episodes: episodesTable,
      })
      .from(podcastsTable)
      .leftJoin(episodesTable, eq(episodesTable.podcastId, podcastsTable.id))
      .where(eq(podcastsTable.id, podcastId))
  );

  if (!podcastWithEpisodes?.[0]?.podcast) {
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

  const podcast = podcastWithEpisodes[0].podcast;

  return (
    <ScrollView>
      <YStack gap='$4' paddingHorizontal='$4' paddingVertical='$4'>
        <XStack>
          <Button
            backgroundColor='transparent'
            onPress={() => router.back()}
            theme='active'
            width='$4'
            marginRight='$-2'
          >
            <ArrowLeft size={24} color='gray' />
          </Button>
        </XStack>

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
            <Paragraph
              numberOfLines={isDescriptionExpanded ? undefined : 3}
              onPress={() => setIsDescriptionExpanded((prev) => !prev)}
              textOverflow='ellipsis'
              color='gray'
              fontSize='$5'
            >
              {podcast.description}
            </Paragraph>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
