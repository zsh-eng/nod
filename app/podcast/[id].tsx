import { EpisodeCard } from '@/components/episode-card';
import db from '@/db';
import { podcastsTable } from '@/db/schema';
import { ArrowLeft, X } from '@tamagui/lucide-icons';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { Button, H2, Paragraph, Stack, Text, XStack, YStack } from 'tamagui';

export default function PodcastPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const podcastId = parseInt(id, 10);

  const { data: podcastWithEpisodes } = useLiveQuery(
    db.query.podcastsTable.findFirst({
      with: {
        episodes: true,
      },
      where: eq(podcastsTable.id, podcastId),
    })
  );

  if (!podcastWithEpisodes) {
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

  const podcast = podcastWithEpisodes;

  const getHeader = () => {
    return (
      <View>
        <XStack marginBottom='$4'>
          <Button
            backgroundColor='transparent'
            onPress={() => router.back()}
            theme='active'
            width='$4'
          >
            <ArrowLeft size={32} color='gray' />
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
            <Paragraph color='gray' fontSize='$5'>
              {podcast.description}
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
      </View>
    );
  };

  // See this link https://stackoverflow.com/questions/58243680/react-native-another-virtualizedlist-backed-container
  // for managing the scroll area when we have a flat list
  return (
    <View>
      <YStack
        gap='$4'
        paddingHorizontal='$4'
        paddingBottom='$4'
        paddingTop='$4'
      >
        <FlatList
          data={podcastWithEpisodes.episodes}
          renderItem={({ item }) => <EpisodeCard episode={item} />}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
          ListHeaderComponent={getHeader}
        />
      </YStack>
    </View>
  );
}
