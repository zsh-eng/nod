import { Podcast } from '@/db/schema';
import { format } from 'date-fns';
import { Image } from 'react-native';
import { Card, H3, Paragraph, XStack, YStack } from 'tamagui';

const formatDate = (date: Date) => {
  return format(date, 'd MMM yyyy');
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  if (!podcast.imageUrl) {
    return null;
  }

  return (
    <Card size='$4'>
      <XStack gap='$3'>
        <Image
          source={{ uri: podcast.imageUrl }}
          style={{ width: 100, height: 100, borderRadius: 4 }}
          resizeMode='cover'
        />
        <YStack gap='$0' justifyContent='flex-start'>
          <H3
            numberOfLines={1}
            textOverflow='ellipsis'
            fontSize={'$5'}
            marginTop={'$0'}
            fontWeight={'700'}
          >
            {podcast.title}
          </H3>
          <Paragraph theme='alt2' size='$2'>
            {podcast.itunesAuthor}
          </Paragraph>
          <Paragraph theme='alt2' size='$1'>
            Updated {formatDate(new Date(podcast.nodDateUpdated))}
          </Paragraph>
        </YStack>
      </XStack>
    </Card>
  );
}
