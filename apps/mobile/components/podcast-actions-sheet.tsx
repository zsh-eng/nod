import { Trash } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button, Sheet, Text, XStack, YStack } from 'tamagui';

type PodcastActionsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeletePodcast: () => Promise<void>;
  podcastTitle?: string;
};

export function PodcastActionsSheet({
  open,
  onOpenChange,
  onDeletePodcast,
  podcastTitle = 'this podcast',
}: PodcastActionsSheetProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    await onDeletePodcast();
    setIsDeleting(false);

    setConfirmVisible(false);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPointsMode='fit'
      modal
      animation='quicksnap'
    >
      <Sheet.Overlay
        // backgroundColor='$shadow6'
        animation='quick'
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame padding='$4'>
        {!confirmVisible ? (
          <YStack gap='$4'>
            <Button
              onPress={() => setConfirmVisible(true)}
              icon={<Trash size={18} color='red' />}
              theme='red'
              size='$5'
              backgroundColor='rgba(255, 0, 0, 0.05)'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size='small' color='white' />
              ) : (
                'Delete Podcast'
              )}
            </Button>
          </YStack>
        ) : (
          <YStack gap='$4'>
            <Text fontSize='$6' fontWeight='bold'>
              Delete Podcast
            </Text>
            <Text fontSize='$4'>
              Are you sure you want to delete {podcastTitle}? This action cannot
              be undone.
            </Text>
            <XStack gap='$3' justifyContent='flex-end' marginTop='$2'>
              <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
              <Button onPress={handleDeleteConfirm} color='red'>
                Delete
              </Button>
            </XStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
