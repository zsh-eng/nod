import { DownloadState } from '@/contexts/download-context';
import { deleteDownload } from '@/service/episode/download';
import { isInProgressDownload } from '@/types/episode';
import { Play, Trash } from '@tamagui/lucide-icons';
import { Button, Progress, Text, XStack, YStack } from 'tamagui';
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatDuration(duration: number | null) {
  if (!duration) {
    return '';
  }

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function EpisodeDownloadCard({
  episodeId,
  download,
}: {
  episodeId: number;
  download: DownloadState;
}) {
  const handlePlay = () => {
    console.log('Playing episode:', episodeId);
  };

  const handleDelete = () => {
    console.log('Deleting episode:', episodeId);
    deleteDownload(episodeId);
  };

  return (
    <YStack
      key={episodeId}
      paddingHorizontal='$3'
      paddingVertical='$4'
      borderWidth={1}
      borderColor='lightgray'
    >
      <XStack alignItems='center' gap='$2'>
        <Text fontSize='$3' color='black' fontWeight='bold'>
          {/* {download.episode.podcast.title} */}
          {/* TODO: add the proper podcast title here */}
          {'The Ezreal Podcast'}
        </Text>
        <Text fontSize='$2' color='gray'>
          {formatDate(download.episode?.pubDate ?? '')}
        </Text>
      </XStack>

      <XStack gap='$3' alignItems='center' marginTop='$2'>
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
          <Progress.Indicator animation='quick' backgroundColor='cyan' />
        </Progress>
      )}

      <XStack justifyContent='space-between' alignItems='center' marginTop='$2'>
        {download.download.status === 'not_started' && (
          <XStack gap='$2'>
            <Button size='$3' onPress={handlePlay} color='gray'>
              <Play size={20} stroke={'black'} color='black' />
              <Text fontSize='$2' color='black' fontWeight={'bold'}>
                Play
              </Text>
              <Text fontSize='$2' color='gray'>
                {' '}
                {formatDuration(download.episode?.itunesDuration)}
              </Text>
            </Button>
            <Button size='$3' onPress={handleDelete} color='gray'>
              <Trash size={16} />
            </Button>
          </XStack>
        )}

        <Text fontSize='$2' color='gray' textTransform='uppercase'>
          {formatStatusText(download.download.status)}
        </Text>
      </XStack>
    </YStack>
  );
}
