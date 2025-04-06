import { MediaPlayer } from '@/components/MediaPlayer';
import { useTracks } from '@/contexts/tracks-context';
import { Download, Home } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
