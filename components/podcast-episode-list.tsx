import { useDownloads } from '@/contexts/download-context';
import db from '@/db';
import { Episode, episodesTable, podcastsTable } from '@/db/schema';
import { useSQLiteQuery } from '@/hooks/use-sqlite-query';
import { updatePodcastFeed } from '@/service/podcast';
import { desc, eq } from 'drizzle-orm';
import { PodcastEpisodeListView } from './podcast-episode-list-view';

interface PodcastEpisodeListProps {
  podcastId: number;
}

export function PodcastEpisodeList({ podcastId }: PodcastEpisodeListProps) {
  const {
    data: podcast,
    loading: podcastLoading,
    error: podcastError,
  } = useSQLiteQuery(() =>
    db.query.podcastsTable.findFirst({
      where: eq(podcastsTable.id, podcastId),
    })
  );

  const {
    data: episodes,
    loading: episodesLoading,
    refetch: refetchEpisodes,
  } = useSQLiteQuery(() =>
    db.query.episodesTable.findMany({
      where: eq(episodesTable.podcastId, podcastId),
      orderBy: desc(episodesTable.pubDateTimestamp),
      limit: 100,
      with: {
        episodeDownloads: true,
      },
    })
  );

  const { startDownload } = useDownloads();

  const handleRefreshEpisodes = async () => {
    await updatePodcastFeed(podcastId);
    await refetchEpisodes();
    return;
  };

  const handleEpisodePress = (episode: Episode) => {
    startDownload(episode);
  };

  return (
    <PodcastEpisodeListView
      podcast={podcast ?? null}
      episodes={episodes}
      podcastError={podcastError}
      onEpisodePress={handleEpisodePress}
      onRefresh={handleRefreshEpisodes}
    />
  );
}
