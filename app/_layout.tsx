import { defaultConfig } from '@tamagui/config/v4'; // for quick config install this
import { Stack } from 'expo-router';
import { createTamagui, TamaguiProvider } from 'tamagui';

const config = createTamagui(defaultConfig);

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  );
}
