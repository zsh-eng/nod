import { Download, Home } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'lightblue' }}>
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
  );
}
