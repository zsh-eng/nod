import { DownloadState } from '@/contexts/download-context';
import { Progress, Text, XStack, YStack } from 'tamagui';

export function EpisodeDownloadCard({
  episodeId,
  download,
}: {
  episodeId: number;
  download: DownloadState;
}) {
  return (
    <YStack key={episodeId} padding='' borderRadius='$4'>
      <XStack gap='$3' alignItems='center'>
        <YStack flex={1}>
          <Text
            fontSize='$6'
            fontWeight='bold'
            numberOfLines={2}
            textOverflow='ellipsis'
          >
            {download.episode.title}
          </Text>
          <Text fontSize='$2' color='gray'>
            {Math.round(download.currentBytes / 1024 / 1024)}MB /{' '}
            {Math.round(download.totalBytes / 1024 / 1024)}MB
          </Text>
        </YStack>
      </XStack>

      <Progress
        value={Math.round(download.progress * 100)}
        marginTop='$2'
        size={`$2`}
      >
        <Progress.Indicator animation='100ms' backgroundColor='cyan' />
      </Progress>
    </YStack>
  );
}
