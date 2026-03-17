import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';

const LOGO = require('../../assets/logo.png');

interface TopHeaderProps {
  showBack?: boolean;
  title?: string;
  transparent?: boolean;
}

export default function TopHeader({ showBack = true, title, transparent = false }: TopHeaderProps) {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const goBack = () => (nav.canGoBack?.() ? nav.goBack() : nav.navigate('Home'));
  const onNotifications = () => nav.navigate('Notifications');
  const onMenu = () => nav.dispatch(DrawerActions.openDrawer());

  return (
    <View style={[
      styles.wrapper,
      { paddingTop: insets.top },
      transparent && styles.wrapperTransparent,
    ]}>
      <View style={styles.inner}>
        {/* Right side (RTL start) */}
        <View style={[styles.side, styles.sideRight]}>
          {showBack ? (
            <Pressable style={styles.iconBtn} onPress={goBack} hitSlop={12}>
              <View style={styles.iconBtnInner}>
                <Ionicons name="chevron-forward" size={20} color={transparent ? COLORS.textOnDark : COLORS.textDark} />
              </View>
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          {title ? (
            <Text style={[styles.title, transparent && styles.titleOnDark]}>{title}</Text>
          ) : (
            <View style={styles.brandWrap}>
              <View style={styles.logoRing}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={[styles.brandText, transparent && styles.brandTextOnDark]}>חב"ד לנוער נתיבות</Text>
            </View>
          )}
        </View>

        {/* Left side (RTL end) */}
        <View style={[styles.side, styles.sideLeft]}>
          <Pressable style={styles.iconBtn} onPress={onNotifications} hitSlop={12}>
            <View style={styles.iconBtnInner}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={transparent ? COLORS.textOnDark : COLORS.textDark}
              />
            </View>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onMenu} hitSlop={12}>
            <View style={styles.iconBtnInner}>
              <Ionicons
                name="menu"
                size={22}
                color={transparent ? COLORS.textOnDark : COLORS.textDark}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.sm,
  },
  wrapperTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 6,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  sideRight: { justifyContent: 'flex-start' },
  sideLeft: { justifyContent: 'flex-end', gap: 0 },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoRing: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.goldLight,
    overflow: 'hidden',
    backgroundColor: COLORS.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 26,
    height: 26,
  },
  brandText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 0.1,
  },
  brandTextOnDark: {
    color: COLORS.goldLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  titleOnDark: {
    color: COLORS.textOnDark,
  },
});
