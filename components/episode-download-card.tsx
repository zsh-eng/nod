import { DownloadState } from '@/contexts/download-context';
import { isInProgressDownload } from '@/types/episode';
import { Progress, Text, XStack, YStack } from 'tamagui';

function formatStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'in_progress':
      return 'downloading';
    case 'not_started':
      return 'not started';
    case 'paused':
      return 'paused';
    default:
      return status;
  }
}
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
          {isInProgressDownload(download.download) && (
            <Text fontSize='$2' color='gray'>
              {Math.round(download.download.currentBytes / 1024 / 1024)}MB /{' '}
              {Math.round(download.download.totalBytes / 1024 / 1024)}MB
            </Text>
          )}
        </YStack>
      </XStack>

      {isInProgressDownload(download.download) && (
        <Progress
          value={Math.round(
            (download.download.currentBytes / download.download.totalBytes) *
              100
          )}
          marginTop='$2'
          size={`$2`}
        >
          <Progress.Indicator animation='100ms' backgroundColor='cyan' />
        </Progress>
      )}

      <Text
        fontSize='$2'
        color='gray'
        alignSelf='flex-end'
        marginTop='$2'
        textTransform='uppercase'
      >
        {formatStatusText(download.download.status)}
      </Text>
    </YStack>
  );
}
