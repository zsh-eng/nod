import { DownloadProvider } from '@/contexts/download-context';
import { defaultConfig } from '@tamagui/config/v4'; // for quick config install this
import { Stack } from 'expo-router';
import { createTamagui, TamaguiProvider } from 'tamagui';

// Create a custom config with modified theme values
const tamaguiConfig = {
  ...defaultConfig,
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
    <TamaguiProvider config={config}>
      <DownloadProvider>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        </Stack>
      </DownloadProvider>
    </TamaguiProvider>
  );
}
