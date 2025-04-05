import { PodcastActionsSheet } from "@/components/podcast-actions-sheet";
import { deletePodcast } from "@/service/podcast";
import { useRouter } from "expo-router";
import { useState } from "react";
import { XStack } from "tamagui";

export default function PodcastActions({
  podcastId,
  actionsSheetOpen,
  setActionsSheetOpen,
}: {
  podcastId: number;
  actionsSheetOpen: boolean;
  setActionsSheetOpen: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleDeletePodcast = async () => { 
    await deletePodcast(podcastId);
    router.back();
  };

  return (
    <PodcastActionsSheet
      open={actionsSheetOpen}
      onOpenChange={setActionsSheetOpen}
      onDeletePodcast={handleDeletePodcast}
      />
  );
}