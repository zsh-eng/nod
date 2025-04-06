// For error handling, see: https://docs.expo.dev/develop/development-builds/use-development-builds/#rebuild-a-development-build
import 'expo-dev-client';

import { DownloadProvider } from '@/contexts/download-context';
import { TracksProvider } from '@/contexts/tracks-context';
import { createAnimations } from '@tamagui/animations-react-native';
import { defaultConfig } from '@tamagui/config/v4'; // for quick config install this
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { createTamagui, TamaguiProvider } from 'tamagui';

// Register playback service
TrackPlayer.registerPlaybackService(
  () => require('@/service/playbackService').default
);

const animations = createAnimations({
  quicksnap: {
    type: 'spring',
    damping: 20, // High damping to minimize bounce
    stiffness: 300, // High stiffness for speed
    mass: 0.5, // Lower mass to make it more responsive
  },
  // Quick response animations
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },

  // Standard, bouncy animation
  bouncy: {
    type: 'spring',
    damping: 9,
    mass: 0.9,
    stiffness: 150,
  },

  lazy: {
    type: 'spring',
    damping: 18,
    stiffness: 50,
  },
  none: {
    type: 'timing', // Use timing instead of spring
    duration: 300, // Zero duration means it happens instantly
  },
}) as any;

// Create a custom config with modified theme values
const tamaguiConfig = {
  ...defaultConfig,
  animations: {
    ...defaultConfig.animations,
    ...animations,
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: 'white',
      backgroundStrong: 'white',
      backgroundHover: '#f5f5f5',
      // Additional background variants
      backgroundPress: '#e5e5e5',
      backgroundFocus: '#f0f0f0',

      // Card backgrounds
      card: 'white',
      cardHover: '#f5f5f5',
    },
  },
};

const config = createTamagui(tamaguiConfig);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <DownloadProvider>
          <TracksProvider>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            </Stack>
          </TracksProvider>
        </DownloadProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
