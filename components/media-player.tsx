import { useTracks } from '@/contexts/tracks-context';
import {
  ChevronDown,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import {
  AnimatePresence,
  Progress,
  Sheet,
  Slider,
  Text,
  XStack,
  YStack,
  styled,
} from 'tamagui';

const AnimatedIcon = styled(YStack, {
  width: 24,
  height: 24,
  alignItems: 'center',
  justifyContent: 'center',
});

function debounce(func: (...args: any[]) => void, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export const MediaPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlayback,
    skipToNext,
    skipToPrevious,
  } = useTracks();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const progress = useProgress();

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  // Handle seeking to a specific position
  const handleSeek = debounce((position: number) => {
    TrackPlayer.seekTo(position);
  }, 200);

  return (
    <>
      <YStack
        backgroundColor='white'
        borderTopWidth={1}
        borderTopColor='lightgray'
        paddingVertical={8}
        paddingHorizontal={12}
        onPress={() => setIsSheetOpen(true)}
      >
        <XStack alignItems='center' gap={4}>
          {currentTrack.artwork && (
            <Image
              source={{ uri: currentTrack.artwork.toString() }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 4,
                marginRight: 10,
              }}
            />
          )}

          <YStack flex={1}>
            <Text fontSize={14} numberOfLines={1} fontWeight='bold'>
              {currentTrack.title}
            </Text>
            <Text fontSize={12} color='gray' numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </YStack>

          <XStack alignItems='center' gap={12} marginLeft={4}>
            <SkipBack
              strokeWidth={1.8}
              hitSlop={10}
              marginHorizontal={8}
              size={18}
              onPress={skipToPrevious}
            />

            <AnimatePresence>
              {isPlaying ? (
                <AnimatedIcon
                  key='pause'
                  animation='quick'
                  enterStyle={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  exitStyle={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  scale={1}
                  opacity={1}
                  pressStyle={{
                    scale: 0.9,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                  }}
                  animateOnly={['transform']}
                  hoverStyle={{ scale: 1.1 }}
                >
                  <Pause strokeWidth={1.8} hitSlop={10} marginHorizontal={8} />
                </AnimatedIcon>
              ) : (
                <AnimatedIcon
                  key='play'
                  animation='quick'
                  enterStyle={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  exitStyle={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  scale={1}
                  opacity={1}
                  pressStyle={{
                    scale: 0.9,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayback();
                  }}
                  animateOnly={['transform']}
                  hoverStyle={{ scale: 1.1 }}
                >
                  <Play strokeWidth={2} hitSlop={10} marginHorizontal={8} />
                </AnimatedIcon>
              )}
            </AnimatePresence>

            <SkipForward
              size={18}
              strokeWidth={1.8}
              hitSlop={10}
              marginHorizontal={8}
              onPress={(e) => {
                e.stopPropagation();
                skipToNext();
              }}
            />
          </XStack>
        </XStack>

        <XStack
          justifyContent='space-between'
          alignItems='center'
          gap={12}
          width='100%'
          marginTop={8}
          paddingHorizontal={4}
        >
          <Text fontSize={10} color='gray'>
            {formatTime(progress.position)}
          </Text>
          <Progress
            value={Math.round((progress.position / progress.duration) * 100)}
            size='$1'
            flex={1}
            marginBottom={4}
          />
          <Text fontSize={10} color='gray'>
            {formatTime(progress.duration)}
          </Text>
        </XStack>
      </YStack>

      {/* Full-screen player sheet */}
      <Sheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        snapPointsMode='fit'
        // snapPoints={[95]}
        dismissOnSnapToBottom
        modal={true}
      >
        <Sheet.Overlay
          backgroundColor='rgba(0,0,0,0.5)'
          animation='quick'
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          backgroundColor='white'
          padding={16}
          justifyContent='space-between'
        >
          <XStack width='100%' justifyContent='flex-end' marginBottom={'$4'}>
            <ChevronDown
              size={'$2'}
              onPress={() => setIsSheetOpen(false)}
              hitSlop={15}
              color='black'
            />
          </XStack>

          <YStack alignItems='center' flex={1} justifyContent='center' gap={24}>
            {currentTrack.artwork && (
              <Image
                source={{ uri: currentTrack.artwork.toString() }}
                style={{ width: 250, height: 250, borderRadius: 8 }}
              />
            )}

            <YStack width='100%' gap={4} alignItems='center'>
              <Text
                fontSize={22}
                fontWeight='bold'
                textAlign='center'
              >
                {currentTrack.title}
              </Text>
              <Text fontSize={16} color='gray' textAlign='center'>
                {currentTrack.artist}
              </Text>
            </YStack>
          </YStack>

          <YStack width='100%' gap={16} marginBottom={'$4'} marginTop={'$4'}>
            <Slider
              defaultValue={[0]}
              max={progress.duration || 100}
              min={0}
              step={1}
              onValueChange={(value) => {
                if (value && value[0]) {
                  handleSeek(value[0]);
                }
              }}
              width='100%'
            >
              <Slider.Track backgroundColor='rgba(0,0,0,0.1)' height={4}>
                <Slider.TrackActive backgroundColor='black' />
              </Slider.Track>
              <Slider.Thumb
                circular
                index={0}
                size={12}
                backgroundColor='black'
              />
            </Slider>

            <XStack
              justifyContent='space-between'
              width='100%'
            >
              <Text fontSize={12} color='gray'>
                {formatTime(progress.position)}
              </Text>
              <Text fontSize={12} color='gray'>
                {formatTime(progress.duration)}
              </Text>
            </XStack>

            <XStack justifyContent='center' alignItems='center' gap={'$10'}>
              <SkipBack
                strokeWidth={1.8}
                size={'$3'}
                hitSlop={15}
                onPress={skipToPrevious}
                color='black'
              />

              {isPlaying ? (
                <Pause
                  strokeWidth={2}
                  size={'$4'}
                  color='black'
                  hitSlop={15}
                  onPress={togglePlayback}
                />
              ) : (
                <Play
                  strokeWidth={2}
                  size={'$4'}
                  color='black'
                  hitSlop={15}
                  onPress={togglePlayback}
                />
              )}

              <SkipForward
                size={'$3'}
                strokeWidth={1.8}
                hitSlop={15}
                onPress={skipToNext}
                color='black'
              />
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
};
