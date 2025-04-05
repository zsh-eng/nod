import { EpisodeDownloadCard } from '@/components/episode-download-card';
import { useDownloads } from '@/contexts/download-context';
import db from '@/db';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { H2, ScrollView, Text, View, YStack } from 'tamagui';

export default function DownloadsPage() {
  const { activeDownloads } = useDownloads();
  const { data: completedDownloads, error: completedDownloadsError } =
    useLiveQuery(
      db.query.episodeDownloadsTable.findMany({
        // where: eq(episodeDownloadsTable.status, 'completed'),
        with: {
          episode: true,
        },
      })
    );

  return (
    <ScrollView>
      <View padding='$4' paddingVertical='$6'>
        <H2 fontWeight='bold'>Downloads</H2>
      </View>
      <YStack gap='$4' padding='$0'>
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

        <View paddingHorizontal='$4'>
          <Text
            fontWeight='bold'
            fontSize='$5'
            textTransform='uppercase'
            color='gray'
          >
            Completed Downloads
          </Text>
        </View>
        {completedDownloadsError && (
          <Text color='red'>
            Error loading completed downloads: {completedDownloadsError.message}
          </Text>
        )}

        {completedDownloads?.map((download) => (
          <EpisodeDownloadCard
            key={download.id}
            episodeId={download.episodeId}
            download={{
              episode: download.episode,
              download: {
                id: download.id,
                episodeId: download.episodeId,
                fileUri: download.fileUri,
                status: download.status as 'completed',
                totalBytes: download.totalBytes,
              },
            }}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
