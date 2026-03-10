import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('../../assets/logo.png');

interface TopHeaderProps {
  showBack?: boolean;
}

export default function TopHeader({ showBack = true }: TopHeaderProps) {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const goBack = () => (nav.canGoBack?.() ? nav.goBack() : nav.navigate('Home'));
  const onNotifications = () => nav.navigate('Updates');
  const onMenu = () => { /* TODO: open drawer/menu */ };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        {/* Right (RTL start): Back */}
        <View style={[styles.side, styles.sideRight]}>
          {showBack ? (
            <Pressable style={styles.iconBtn} onPress={goBack} hitSlop={12}>
              <Feather name="arrow-right" size={22} color="#1C1C1E" style={{ transform: [{ rotate: '180deg' }] }} />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>

        {/* Center: Logo + Text (orange) */}
        <View style={styles.center}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>חב"ד לנוער נתיבות</Text>
        </View>

        {/* Left (RTL end): Notifications + Hamburger */}
        <View style={[styles.side, styles.sideLeft]}>
          <Pressable style={styles.iconBtn} onPress={onNotifications} hitSlop={12}>
            <Feather name="bell" size={22} color="#1C1C1E" />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onMenu} hitSlop={12}>
            <Feather name="menu" size={22} color="#1C1C1E" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 12,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 96,
  },
  sideRight: { justifyContent: 'flex-start' },
  sideLeft: { justifyContent: 'flex-end' },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E8A96A',
  },
});
