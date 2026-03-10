import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import DailyScreen from './src/screens/DailyScreen';
import ChavrutotScreen from './src/screens/ChavrutotScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// סדר הטאבים מימין לשמאל: פרופיל | הגדרות | חברותא | עדכונים | בית
const TABS = [
  { name: 'Profile', component: ProfileScreen, icon: 'user', label: 'פרופיל' },
  { name: 'Settings', component: SettingsScreen, icon: 'settings', label: 'הגדרות' },
  { name: 'Chavrutot', component: ChavrutotScreen, icon: 'users', label: 'חברותא' },
  { name: 'Updates', component: UpdatesScreen, icon: 'rss', label: 'עדכונים' },
  { name: 'Home', component: HomeScreen, icon: 'home', label: 'בית' },
];

function TabNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabWrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabBar}>
        <BlurView intensity={92} tint="light" style={styles.blur} />
        <View style={styles.tabContent}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const tab = TABS.find((t) => t.name === route.name)!;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            return (
              <Pressable key={route.key} style={[styles.tabItem, isFocused && styles.tabItemActive]} onPress={onPress}>
                <Feather name={tab.icon as any} size={22} color={isFocused ? '#2fa0b0' : '#8E8E93'} style={{ opacity: isFocused ? 1 : 0.7 }} />
                <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tab.label}</Text>
                <View style={[styles.indicator, { backgroundColor: isFocused ? '#2fa0b0' : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Daily" component={DailyScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabWrapper: { position: 'absolute', bottom: 0, left: 12, right: 12, alignItems: 'center' },
  tabBar: {
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.75)',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24 }, android: { elevation: 12 } }),
  },
  blur: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderRadius: 28 },
  tabContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', height: 68, paddingHorizontal: 4 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 18 },
  tabItemActive: { backgroundColor: 'rgba(75, 191, 207, 0.12)' },
  tabLabel: { fontSize: 10, fontWeight: '500', color: '#8E8E93', marginTop: 2 },
  tabLabelActive: { color: '#2fa0b0', fontWeight: '700' },
  indicator: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
});
