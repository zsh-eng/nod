import { useTracks } from '@/contexts/tracks-context';
import { Pause, Play, SkipBack, SkipForward } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import React from 'react';
import { useProgress } from 'react-native-track-player';
import { Progress, Text, XStack, YStack } from 'tamagui';

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
      paddingHorizontal='$3'
    >
      <XStack alignItems='center' gap='$1'>
        {currentTrack.artwork && (
          <Image
            source={{ uri: currentTrack.artwork.toString() }}
            style={{ width: 50, height: 50, borderRadius: 4, marginRight: 10 }}
          />
        )}

        <YStack flex={1}>
          <Text fontSize='$2' numberOfLines={1} fontWeight='bold'>
            {currentTrack.title}
          </Text>
          <Text fontSize='$1' color='gray' numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </YStack>

        <XStack alignItems='center' gap='$1' marginLeft='$1'>
          <SkipBack
            strokeWidth={1.8}
            hitSlop={10}
            marginHorizontal={'$2'}
            size={18}
            onPress={skipToPrevious}
          />

          {isPlaying ? (
            <Pause
              strokeWidth={1.8}
              hitSlop={10}
              marginHorizontal={'$2'}
              onPress={togglePlayback}
            />
          ) : (
            <Play
              strokeWidth={2}
              hitSlop={10}
              marginHorizontal={'$2'}
              onPress={togglePlayback}
            />
          )}

          <SkipForward
            size={18}
            strokeWidth={1.8}
            hitSlop={10}
            marginHorizontal={'$2'}
            onPress={skipToNext}
          />
        </XStack>
      </XStack>

      <XStack
        justifyContent='space-between'
        alignItems='center'
        gap='$3'
        width='100%'
        marginTop='$2'
        paddingHorizontal='$1'
      >
        <Text fontSize='$1' color='gray'>
          {formatTime(progress.position)}
        </Text>
        <Progress
          value={Math.round((progress.position / progress.duration) * 100)}
          size='$1'
          flex={1}
          marginBottom={'$1'}
        />
        <Text fontSize='$1' color='gray'>
          {formatTime(progress.duration)}
        </Text>
      </XStack>
    </YStack>
  );
};
