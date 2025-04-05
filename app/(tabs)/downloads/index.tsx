import { EpisodeDownloadCard } from '@/components/episode-download-card';
import { useDownloads } from '@/contexts/download-context';
import { H2, ScrollView, Text, YStack } from 'tamagui';

export default function DownloadsPage() {
  const { activeDownloads } = useDownloads();

  return (
    <ScrollView>
      <YStack gap='$4' padding='$4' paddingVertical='$6'>
        <H2 fontWeight='bold'>Downloads</H2>

        {Object.entries(activeDownloads).map(([episodeId, download]) => (
          <EpisodeDownloadCard
            key={episodeId}
            episodeId={parseInt(episodeId)}
            download={download}
          />
        ))}

        {Object.keys(activeDownloads).length === 0 && (
          <Text color='gray'>No active downloads</Text>
        )}
      </YStack>
    </ScrollView>
  );
}
