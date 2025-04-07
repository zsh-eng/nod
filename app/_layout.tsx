// For error handling, see: https://docs.expo.dev/develop/development-builds/use-development-builds/#rebuild-a-development-build
import 'expo-dev-client';

import { DownloadProvider } from '@/contexts/download-context';
import { TracksProvider } from '@/contexts/tracks-context';
import { animations } from '@/theme/animation';
import { allThemes } from '@/theme/themes';
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
    ...animations,
  },
  themes: {
    ...allThemes,
  },
};

const config = createTamagui(tamaguiConfig);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme='light'>
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
