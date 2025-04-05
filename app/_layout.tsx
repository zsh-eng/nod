import { DownloadProvider } from '@/contexts/download-context';
import { createAnimations } from '@tamagui/animations-react-native';
import { defaultConfig } from '@tamagui/config/v4'; // for quick config install this
import { Stack } from 'expo-router';
import { createTamagui, TamaguiProvider } from 'tamagui';

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
    <TamaguiProvider config={config}>
      <DownloadProvider>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        </Stack>
      </DownloadProvider>
    </TamaguiProvider>
  );
}
