import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/heebo';
import { Heebo_900Black } from '@expo-google-fonts/heebo';
import * as Notifications from 'expo-notifications';

import './src/config/firebase';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { registerForPushNotifications, addNotificationResponseListener } from './src/services/notificationService';

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
import ChabadHousesScreen from './src/screens/ChabadHousesScreen';
import ShiurimScreen from './src/screens/ShiurimScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SplashScreenComponent from './src/components/SplashScreen';

// ── Design tokens (inlined to avoid circular imports in App.tsx) ──────────────
const NAVY = '#141928';
const NAVY_MID = '#1E2740';
const GOLD = '#D4A54A';
const GOLD_LIGHT = '#E8C97A';
const GOLD_MUTED = 'rgba(212,165,74,0.12)';
const CREAM = '#FAF7F2';
const WHITE = '#FFFFFF';
const TEXT_LIGHT = '#94A0B4';
const BORDER = 'rgba(0,0,0,0.07)';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createNativeStackNavigator();

// ─── Auth flow ────────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Tab bar icon with active indicator ───────────────────────────────────────
function TabIcon({
  name,
  focused,
  color,
  size,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color: string;
  size: number;
}) {
  return (
    <View style={tabIconStyles.wrap}>
      {focused && <View style={tabIconStyles.dot} />}
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  dot: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
});

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: TEXT_LIGHT,
        tabBarStyle: {
          backgroundColor: WHITE,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: BORDER,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          // iOS shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          // Android
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} size={size} />
          ),
          tabBarLabel: 'בית',
        }}
      />
      <Tab.Screen
        name="Shiurim"
        component={ShiurimScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'book' : 'book-outline'} focused={focused} color={color} size={size} />
          ),
          tabBarLabel: 'שיעורים',
        }}
      />
      <Tab.Screen
        name="Chavrutot"
        component={ChavrutotScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} color={color} size={size} />
          ),
          tabBarLabel: 'חברותא',
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdatesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'images' : 'images-outline'} focused={focused} color={color} size={size} />
          ),
          tabBarLabel: 'עדכונים',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} size={size} />
          ),
          tabBarLabel: 'פרופיל',
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Main Stack (inside drawer) ───────────────────────────────────────────────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Daily" component={DailyScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Volunteer" component={VolunteerScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function CustomDrawerContent(props: any) {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const displayName = profile?.displayName ?? user?.displayName ?? 'אורח';
  const avatar = profile?.gender === 'female' ? '👧' : '👦';
  const isLoggedIn = user && !user.isAnonymous;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: insets.top }}
      style={{ backgroundColor: NAVY }}
    >
      {/* Header */}
      <View style={drawerStyles.header}>
        {/* Accent glow orb */}
        <View style={drawerStyles.headerOrb} />

        <View style={drawerStyles.avatarWrap}>
          <Text style={drawerStyles.avatarEmoji}>{isLoggedIn ? avatar : '👤'}</Text>
        </View>

        <View style={drawerStyles.brandRow}>
          <Text style={drawerStyles.logo}>חב"ד</Text>
          <Text style={drawerStyles.logoSub}>לנוער נתיבות</Text>
        </View>

        {isLoggedIn && displayName !== 'אורח' ? (
          <View style={drawerStyles.userPill}>
            <Ionicons name="person-circle-outline" size={13} color={GOLD} />
            <Text style={drawerStyles.userName}>{displayName}</Text>
          </View>
        ) : (
          <Text style={drawerStyles.guestLabel}>לא מחובר</Text>
        )}

        {/* Gold divider */}
        <View style={drawerStyles.headerDivider} />
      </View>

      {/* Nav items */}
      <DrawerItemList
        {...props}
      />

      {/* Bottom padding */}
      <View style={{ height: insets.bottom + 24 }} />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  const { profile } = useAuth();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: GOLD,
        drawerInactiveTintColor: 'rgba(255,255,255,0.55)',
        drawerActiveBackgroundColor: GOLD_MUTED,
        drawerStyle: {
          backgroundColor: NAVY,
          width: 280,
          borderRightWidth: 0,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: 0.1,
        },
        drawerItemStyle: {
          borderRadius: 10,
          marginHorizontal: 8,
          marginVertical: 1,
        },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={MainStack}
        options={{
          drawerLabel: 'בית',
          drawerIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          drawerLabel: 'חברים שלנו',
          drawerIcon: ({ color }) => <Feather name="users" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="ChabadHouses"
        component={ChabadHousesScreen}
        options={{
          drawerLabel: 'בתי חב"ד בעיר',
          drawerIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerLabel: 'הגדרות',
          drawerIcon: ({ color }) => <Feather name="settings" size={20} color={color} />,
        }}
      />
      {profile?.isAdmin && (
        <Drawer.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            drawerLabel: 'ניהול (הרב)',
            drawerIcon: ({ color }) => <Feather name="shield" size={20} color={color} />,
          }}
        />
      )}
    </Drawer.Navigator>
  );
}

// ─── App Stack (auth gate) ────────────────────────────────────────────────────
function AppNavigator() {
  const { user, profile, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Register push notifications after login
  useEffect(() => {
    if (user && !user.isAnonymous) {
      registerForPushNotifications(user.uid).catch(() => {});
    }
  }, [user?.uid]);

  // Handle notification taps (navigate to Notifications screen)
  useEffect(() => {
    const sub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as any;
      if (navigationRef.current) {
        navigationRef.current.navigate('Notifications');
      }
    });
    return () => sub.remove();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NAVY }}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  const isLoggedIn = user && !user.isAnonymous;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isLoggedIn ? (
        <Stack.Screen name="App" component={DrawerNavigator} />
      ) : (
        <>
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="App" component={DrawerNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}

function AppWithNavigation() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { user } = useAuth();

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);
  const [fontsLoaded] = useFonts({ Heebo_900Black });
  const [splashDone, setSplashDone] = useState(false);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {!splashDone && (
          <SplashScreenComponent onFinish={() => setSplashDone(true)} />
        )}
        <AppWithNavigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// ─── Drawer header styles ─────────────────────────────────────────────────────
const drawerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginBottom: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  headerOrb: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${GOLD}18`,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: NAVY_MID,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${GOLD}40`,
    marginBottom: 14,
    // gold glow
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEmoji: { fontSize: 28 },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: GOLD,
  },
  logoSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },

  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: GOLD_MUTED,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${GOLD}25`,
    marginBottom: 6,
  },
  userName: {
    fontSize: 12,
    color: GOLD_LIGHT,
    fontWeight: '600',
  },
  guestLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },

  headerDivider: {
    height: 1,
    backgroundColor: `${GOLD}20`,
    marginTop: 14,
    marginHorizontal: -20,
  },
});
