import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';
import { Input, Sheet } from 'tamagui';

export function NewPodcastSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    } else {
      Keyboard.dismiss();
    }
  }, [open]);

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
        <Input
          ref={inputRef}
          value={url}
          onChangeText={setUrl}
          placeholder='Enter RSS feed URL...'
          borderWidth={0}
          backgroundColor='transparent'
          fontSize='$5'
        />
      </Sheet.Frame>
    </Sheet>
  );
}
