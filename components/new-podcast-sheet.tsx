import { NewPodcastCard } from '@/components/new-podcast-card';
import { Podcast } from '@/db/schema';
import { parsePodcastFeed, PodcastFeed } from '@/lib/parser';
import { LoaderCircle, SendHorizontal, X } from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, TextInput } from 'react-native';
import { Input, Sheet, XStack } from 'tamagui';

function InputIcon({
  state,
  onSubmit,
  onDelete,
}: {
  state: 'loading' | 'to-submit' | 'to-delete' | 'hidden';
  onSubmit: () => void;
  onDelete: () => void;
}) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'loading') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [state]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (state === 'hidden') {
    return null;
  }

  // we don't use the `<Spinner>` because there's only fixed sizes
  if (state === 'loading') {
    return (
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <LoaderCircle size={24} color='lightblue' />
      </Animated.View>
    );
  }

  if (state === 'to-delete') {
    return (
      <X
        size={24}
        color='lightblue'
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={onDelete}
      />
    );
  }

  return (
    <SendHorizontal
      size={24}
      color='lightblue'
      borderColor='lightblue'
      onPress={onSubmit}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    />
  );
}

export function NewPodcastSheet({
  open,
  onOpenChange,
  onAddPodcast,
  existingPodcasts = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPodcast: (podcast: PodcastFeed) => void;
  existingPodcasts?: Podcast[];
}) {
  const [url, setUrl] = useState('');
  const [podcast, setPodcast] = useState<PodcastFeed | null>(null);
  const podcastExists = existingPodcasts.some(
    (p) => p.feedUrl === url
  );

  const inputRef = useRef<TextInput>(null);

  const [buttonState, setButtonState] = useState<
    'loading' | 'to-submit' | 'to-delete' | 'hidden'
  >('hidden');

  useEffect(() => {
    if (open && inputRef.current) {
      if (!podcast) {
        inputRef.current.focus();
      }
    } else {
      Keyboard.dismiss();
    }
  }, [open, podcast]);

  function onUrlChange(url: string) {
    if (url.length === 0) {
      setButtonState('hidden');
    } else {
      setUrl(url);
      setPodcast(null);
      setButtonState('to-submit');
    }
  }

  function handleDelete() {
    setUrl('');
    setButtonState('hidden');
  }

  async function handleSubmit() {
    if (podcast) {
      // clicking submit when we've loaded a podcast shouldn't do anything
      return;
    }

    Keyboard.dismiss();
    setButtonState('loading');
    const parsedPodcast = await parsePodcastFeed(url);
    console.log('parsedPodcast', parsedPodcast?.podcast);
    setPodcast(parsedPodcast);
    setButtonState('to-delete');
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
      <Sheet.Frame
        paddingVertical='$2'
        paddingHorizontal='$0'
        borderRadius={0}
        animation='medium'
      >
        <XStack gap='$2' alignItems='center' paddingRight={'$3'}>
          <Input
            ref={inputRef}
            value={url}
            onChangeText={onUrlChange}
            onSubmitEditing={handleSubmit}
            placeholder='Enter RSS feed URL...'
            borderWidth={0}
            backgroundColor='transparent'
            fontSize='$5'
            flex={1}
          />

          <InputIcon
            state={buttonState}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        </XStack>

        {podcast && podcast?.podcast && (
          <NewPodcastCard
            podcast={podcast}
            onAdd={() => onAddPodcast(podcast)}
            podcastExists={podcastExists}
          />
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
