import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// אתחול Firebase עם הפעלת האפליקציה
import './src/config/firebase';

import HomeScreen from './src/screens/HomeScreen';
import DailyScreen from './src/screens/DailyScreen';
import ChavrutotScreen from './src/screens/ChavrutotScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import VolunteerScreen from './src/screens/VolunteerScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF8C42',
        tabBarInactiveTintColor: '#9BA3AF',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />, tabBarLabel: 'בית' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />, tabBarLabel: 'התראות' }} />
      <Tab.Screen name="Updates" component={UpdatesScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="images" size={24} color={color} />, tabBarLabel: 'עדכונים' }} />
      <Tab.Screen name="Chavrutot" component={ChavrutotScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />, tabBarLabel: 'חברותא' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />, tabBarLabel: 'הגדרות' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />, tabBarLabel: 'פרופיל' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Daily" component={DailyScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Volunteer" component={VolunteerScreen} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={drawerStyles.header}>
        <Text style={drawerStyles.logo}>חב"ד</Text>
        <Text style={drawerStyles.title}>לנוער נתיבות</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#FF8C42',
        drawerInactiveTintColor: '#666',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={MainStack}
        options={{
          drawerLabel: 'בית',
          drawerIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          drawerLabel: 'חברים שלנו',
          drawerIcon: ({ color }) => <Feather name="users" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          drawerLabel: 'ניהול (הרב)',
          drawerIcon: ({ color }) => <Feather name="shield" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <DrawerNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const drawerStyles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 20, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  logo: { fontSize: 22, fontWeight: '800', color: '#E8A96A' },
  title: { fontSize: 15, color: '#666', marginTop: 2 },
});
