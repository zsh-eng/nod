import { Button, Image, Text, YStack } from 'tamagui';
import type { PodcastFeed } from '../lib/parser';

interface NewPodcastCardProps {
  podcast: PodcastFeed;
  onAdd: () => void;
}

export function NewPodcastCard({ podcast, onAdd }: NewPodcastCardProps) {
  return (
    <YStack gap='$3' alignItems='center' paddingVertical='$6'>
      <YStack gap='$1' alignItems='center'>
        <Text fontSize='$3' color='gray' textAlign='center'>
          {podcast.podcast.itunesAuthor}
        </Text>
        <Text fontSize='$7' fontWeight='bold' textAlign='center'>
          {podcast.podcast.title}
        </Text>
      </YStack>

      {podcast.podcast.image?.url && (
        <Image
          source={{ uri: podcast.podcast.image.url }}
          width={'75%'}
          aspectRatio={1}
          borderRadius={20}
        />
      )}

      <Button
        onPress={onAdd}
        backgroundColor='rgba(211, 211, 211, 0.2)'
        color='black'
        size='$5'
        width={'85%'}
        height={64}
        marginTop='$4'
      >
        Add Podcast
      </Button>
    </YStack>
  );
}
