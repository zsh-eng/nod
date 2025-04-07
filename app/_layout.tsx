// For error handling, see: https://docs.expo.dev/develop/development-builds/use-development-builds/#rebuild-a-development-build
import 'expo-dev-client';

import { DownloadProvider } from '@/contexts/download-context';
import { TracksProvider } from '@/contexts/tracks-context';
import { animations } from '@/theme/animation';
import { defaultConfig } from '@tamagui/config/v4'; // for quick config install this
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer from 'react-native-track-player';
import { createTamagui, TamaguiProvider } from 'tamagui';
// Register playback service
TrackPlayer.registerPlaybackService(
  () => require('@/service/playbackService').default
);

// Create a custom config with modified theme values
const tamaguiConfig = {
  ...defaultConfig,
  animations: {
    // weird but swapping the order fixes the type error
    ...animations,
    ...defaultConfig.animations,
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
