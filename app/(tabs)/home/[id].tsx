import PodcastActions from '@/components/podcast-actions';
import { PodcastEpisodeList } from '@/components/podcast-episode-list';
import { ArrowLeft, EllipsisVertical } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button, XStack, YStack } from 'tamagui';

export default function PodcastPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const podcastId = parseInt(id, 10);
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);

  const memoizedPodcastList = useMemo(() => {
    return <PodcastEpisodeList podcastId={podcastId} />;
  }, [podcastId]);

  return (
    <YStack gap='$2' paddingBottom='$10'>
      <XStack marginLeft='$2' marginTop='$2' justifyContent='space-between'>
        <Button
          backgroundColor='transparent'
          onPress={() => router.back()}
          theme='active'
          width='$4'
          hitSlop={10}
        >
          <ArrowLeft size={28} color='gray' />
        </Button>

        <Button
          backgroundColor='transparent'
          onPress={() => setActionsSheetOpen(true)}
          theme='active'
          width='$4'
          hitSlop={10}
        >
          <EllipsisVertical size={28} color='gray' />
        </Button>
      </XStack>

      {memoizedPodcastList}
      <PodcastActions
        podcastId={podcastId}
        actionsSheetOpen={actionsSheetOpen}
        setActionsSheetOpen={setActionsSheetOpen}
      />
    </YStack>
  );
}
