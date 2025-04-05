import { Episode } from '@/db/schema';
import { stripHtml } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Card, Text, XStack, YStack } from 'tamagui';

function formatDuration(duration: number | null) {
  if (!duration) return '';

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);

  if (hours > 0) {
    return `${hours}H ${minutes}MIN`;
  }
  return `${minutes} MIN`;
}

function formatPubDate(pubDate: string | null) {
  if (!pubDate) return '';
  return formatDistanceToNow(new Date(pubDate), {
    addSuffix: true,
  }).toUpperCase();
}

export function EpisodeCard({
  episode,
  onPress,
}: {
  episode: Episode;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress}>
      <YStack padding='' gap='$2'>
        <XStack justifyContent='space-between'>
          <Text color='gray' fontSize='$2' textTransform='uppercase'>
            {formatPubDate(episode.pubDate)}
          </Text>

          <Text color='gray' fontSize='$2'>
            {formatDuration(episode.itunesDuration)}
          </Text>
        </XStack>

        <Text
          fontSize='$6'
          fontWeight='bold'
          numberOfLines={2}
          textOverflow='ellipsis'
        >
          {episode.title}
        </Text>

        {episode.description && (
          <Text
            fontSize='$4'
            color='gray'
            numberOfLines={2}
            textOverflow='ellipsis'
          >
            {stripHtml(episode.description)}
          </Text>
        )}
      </YStack>
    </Card>
  );
}
