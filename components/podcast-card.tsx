import { Podcast } from '@/db/schema';
import { format } from 'date-fns';
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';

const formatDate = (date: Date) => {
  return format(date, 'd MMM yyyy');
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  if (!podcast.imageUrl && !podcast.itunesImage) {
    return null;
  }

  const imageUrl = podcast.imageUrl || podcast.itunesImage;

  return (
    <Card>
      <XStack gap='$3' alignItems='flex-start'>
        <Image
          source={{ uri: imageUrl! }}
          style={{ width: 88, height: 88, borderRadius: 4 }}
          resizeMode='cover'
        />

        {/* Can't figure out the centering of this for some reason */}
        <YStack
          gap='$0'
          justifyContent='flex-start'
          flex={1}
          height='100%'
        >
          <Text
            marginTop={'$2'}
            numberOfLines={1}
            textOverflow='ellipsis'
            fontSize={'$7'}
            fontWeight={'700'}
          >
            {podcast.title}
          </Text>

          <Text theme='alt2' fontSize={'$2'}>
            {podcast.itunesAuthor}
          </Text>
          <Text theme='alt2' fontSize={'$2'}>
            Updated {formatDate(new Date(podcast.nodDateUpdated))}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
}
