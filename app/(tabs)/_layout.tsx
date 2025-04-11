import { MediaPlayer } from '@/components/media-player';
import { useTracks } from '@/contexts/tracks-context';
import { Download, Home, Inbox } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

export default function TabsLayout() {
  const { currentTrack } = useTracks();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: 'lightblue',
          }}
        >
          <Tabs.Screen
            name='home'
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name='inbox/index'
            options={{
              title: 'Inbox',
              tabBarIcon: ({ color }) => <Inbox size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name='downloads/index'
            options={{
              title: 'Downloads',
              tabBarIcon: ({ color }) => <Download size={24} color={color} />,
            }}
          />
        </Tabs>
      </View>

      {currentTrack && <MediaPlayer />}
    </SafeAreaView>
  );
}
