import { Podcast } from '../db/schema';
import { ScrollView, YStack } from 'tamagui';
import { PodcastCard } from './podcast-card';

interface PodcastListProps {
  podcasts: Podcast[];
}

export function PodcastList({ podcasts }: PodcastListProps) {
  return (
    <ScrollView>
      <YStack gap='$4'>
        {podcasts.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </YStack>
    </ScrollView>
  );
}
