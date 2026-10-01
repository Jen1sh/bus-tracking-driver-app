import useLocationTracking from '@/hooks/use-location-tracking';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';

const ProtectedLayout = () => {
  const { theme } = useUnistyles();

  // Mounted here rather than on a screen so it lives for the whole authenticated session. On Home it
  // would stop the moment the driver switched tabs, and the stream would be torn down and rebuilt
  // every time they came back.
  useLocationTracking();

  return (
    <Tabs
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryTint,
      }}>
      <Tabs.Screen
        name='index'
        options={{
          tabBarLabel: 'Home',
          tabBarIcon({ color, focused, size }) {
            return <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />;
          },
        }}
      />

      <Tabs.Screen
        name='schedule'
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon({ color, focused, size }) {
            return (
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                color={color}
                size={size}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name='profile'
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon({ color, focused, size }) {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? 'person-circle' : 'person-circle-outline'}
              />
            );
          },
        }}
      />
      <Tabs.Screen name='(stack)' options={{ href: null }} />
    </Tabs>
  );
};

export default ProtectedLayout;
