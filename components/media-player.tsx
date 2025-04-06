import { useTracks } from '@/contexts/tracks-context';
import { Pause, Play, SkipBack, SkipForward } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import React from 'react';
import { useProgress } from 'react-native-track-player';
import { Button, Progress, Text, XStack, YStack } from 'tamagui';

export const MediaPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayback,
    skipToNext,
    skipToPrevious,
  } = useTracks();

  const progress = useProgress();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  return (
    <YStack
      backgroundColor='$background'
      borderTopWidth={1}
      borderTopColor='$borderColor'
      paddingVertical='$2'
      paddingHorizontal='$4'
    >
      <Progress
        value={(progress.position / progress.duration) * 100}
        size='$1'
        marginBottom='$2'
      />

      <XStack alignItems='center'>
        {currentTrack.artwork && (
          <Image
            source={{ uri: currentTrack.artwork.toString() }}
            style={{ width: 50, height: 50, borderRadius: 4, marginRight: 10 }}
          />
        )}

        <YStack flex={1}>
          <Text fontSize='$2' numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text fontSize='$1' color='gray' numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </YStack>

        <XStack alignItems='center'>
          <Button
            icon={SkipBack}
            size='$3'
            chromeless
            onPress={skipToPrevious}
          />

          <Button
            icon={isPlaying ? Pause : Play}
            size='$5'
            circular
            marginHorizontal='$2'
            onPress={togglePlayback}
          />

          <Button
            icon={SkipForward}
            size='$3'
            chromeless
            onPress={skipToNext}
          />
        </XStack>
      </XStack>

      <XStack justifyContent='space-between' marginTop='$2'>
        <Text fontSize='$1' color='gray'>
          {formatTime(progress.position)}
        </Text>
        <Text fontSize='$1' color='gray'>
          {formatTime(progress.duration)}
        </Text>
      </XStack>
    </YStack>
  );
};
