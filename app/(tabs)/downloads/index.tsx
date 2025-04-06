import { EpisodeDownloadCard } from '@/components/episode-download-card';
import { useDownloads } from '@/contexts/download-context';
import { useTracks } from '@/contexts/tracks-context';
import db from '@/db';
import { episodeDownloadsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { H2, ScrollView, Text, View, YStack } from 'tamagui';

export default function DownloadsPage() {
  const { activeDownloads } = useDownloads();
  const { isPlayerReady, addTracks, playTrack, reset } = useTracks();
  const { data: completedDownloads, error: completedDownloadsError } =
    useLiveQuery(
      db.query.episodeDownloadsTable.findMany({
        where: eq(episodeDownloadsTable.status, 'completed'),
        with: {
          episode: true,
        },
      })
    );

  console.log(
    'episode and download ids',
    completedDownloads?.map((download) => ({
      episodeId: download.episodeId,
      downloadId: download.id,
    }))
  );

  return (
    <ScrollView>
      <View padding='$4' paddingVertical='$6'>
        <H2 fontWeight='bold'>Downloads</H2>
      </View>
      <YStack gap='$2' padding='$0'>
        {Object.entries(activeDownloads).map(([episodeId, download]) => (
          <EpisodeDownloadCard
            key={episodeId}
            episodeId={parseInt(episodeId)}
            download={download}
          />
        ))}

        <View paddingHorizontal='$4' marginBottom='$2'>
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
            onPlay={async () => {
              if (isPlayerReady) {
                await reset();
                await addTracks([
                  {
                    id: download.episodeId,
                    title: download.episode.title,
                    artist: download.episode.itunesAuthor ?? undefined,
                    artwork: download.episode.itunesImage ?? undefined,
                    url: download.fileUri,
                    duration: download.episode.itunesDuration ?? undefined,
                  },
                ]);
                await playTrack(0);
              }
            }}
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
