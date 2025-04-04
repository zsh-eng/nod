import { NewPodcastCard } from '@/components/new-podcast-card';
import { parsePodcastFeed, PodcastFeed } from '@/lib/parser';
import { Send } from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { Input, Sheet, XStack } from 'tamagui';

export function NewPodcastSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState('');
  const [podcast, setPodcast] = useState<PodcastFeed | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  }, [open]);

  function onUrlChange(url: string) {
    setUrl(url);
    setPodcast(null);
  }

  async function handleSubmit() {
    const podcast = await parsePodcastFeed(url);
    setPodcast(podcast);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPointsMode='fit'
      modal={true}
    >
      <Sheet.Overlay
        backgroundColor='$shadow6'
        animation='lazy'
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame paddingVertical='$2' paddingHorizontal='$2'>
        <XStack space='$2' alignItems='center'>
          <Input
            ref={inputRef}
            value={url}
            onChangeText={onUrlChange}
            placeholder='Enter RSS feed URL...'
            borderWidth={0}
            backgroundColor='transparent'
            fontSize='$5'
            flex={1}
          />

          <Send
            size={24}
            color='lightblue'
            borderColor='lightblue'
            marginRight={'$2'}
            onPress={handleSubmit}
          />
        </XStack>

        {podcast && podcast?.podcast && (
          <NewPodcastCard podcast={podcast} onAdd={() => {}} />
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
