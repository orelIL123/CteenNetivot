import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/appStore';
import { useAuth } from '../contexts/AuthContext';
import { setUserProfileFirestore, uploadUserAvatar } from '../services/firestore';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

const AVATARS = ['🧑', '👦', '👧', '👨', '👩', '🧒', '😊', '🤓', '📚', '✨'];

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={ir.row}>
      <View style={ir.iconWrap}>
        <Feather name={icon as any} size={15} color={COLORS.gold} />
      </View>
      <View style={ir.text}>
        <Text style={ir.label}>{label}</Text>
        <Text style={ir.value}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const { user, profile, signOut, deleteAccount } = useAuth();
  const { userName, userAvatar, setUserProfile } = useAppStore();

  const displayName = profile?.displayName ?? user?.displayName ?? userName ?? 'אורח';
  const avatar = profile?.gender === 'female' ? '👧' : profile ? '👦' : userAvatar;
  const isLoggedIn = user && !user.isAnonymous;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [uploading, setUploading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handlePickImage = async () => {
    if (!isLoggedIn) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0] && user?.uid) {
      setUploading(true);
      const url = await uploadUserAvatar(user.uid, result.assets[0].uri);
      if (url) {
        setUserProfile(name, url);
        await setUserProfileFirestore(user.uid, { displayName: name, avatar: url });
        setSelectedAvatar(url);
      } else {
        Alert.alert('שגיאה', 'לא הצלחנו להעלות את התמונה');
      }
      setUploading(false);
    }
  };

  const handleSave = () => {
    setUserProfile(name, selectedAvatar);
    if (user?.uid) {
      setUserProfileFirestore(user.uid, { displayName: name, avatar: selectedAvatar });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('התנתקות', 'בטוח שרוצה להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק', style: 'destructive', onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'מחיקת חשבון',
      'החשבון יימחק לצמיתות יחד עם הפרופיל, התגובות, ה-RSVP והעדפות המשויכות אליו. לא ניתן לשחזר פעולה זו.',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק חשבון',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              await deleteAccount();
              setUserProfile('', '🧑');
              Alert.alert('החשבון נמחק', 'החשבון והנתונים המשויכים נמחקו בהצלחה.');
            } catch (error: any) {
              const errorCode = error?.code as string | undefined;
              if (errorCode === 'auth/requires-recent-login') {
                Alert.alert('נדרשת התחברות מחדש', 'לצורך מחיקת החשבון יש להתנתק, להתחבר שוב ואז לנסות למחוק מחדש.');
              } else {
                Alert.alert('שגיאה', 'לא הצלחנו למחוק את החשבון. נסה שוב.');
              }
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const favCount = useAppStore.getState().favoriteChavruta.length;
  const notifCount = Object.keys(useAppStore.getState().notifications).length;

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero identity banner ─────────────────────────────────── */}
        <View style={styles.heroBanner}>
          {/* Decorative orbs */}
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          {/* Avatar */}
          <Pressable
            style={styles.avatarOuter}
            onPress={handlePickImage}
            disabled={!isLoggedIn || uploading}
          >
            <View style={styles.avatarRing}>
              {uploading ? (
                <ActivityIndicator color={COLORS.gold} />
              ) : avatar && typeof avatar === 'string' && avatar.startsWith('http') ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{isLoggedIn ? avatar : '👤'}</Text>
              )}
            </View>
            {isLoggedIn && !uploading && (
              <View style={styles.cameraBtn}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            )}
          </Pressable>

          <Text style={styles.heroName}>{isLoggedIn ? displayName : 'אורח'}</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="star" size={11} color={COLORS.gold} />
            <Text style={styles.heroBadgeText}>
              {isLoggedIn ? 'חב"ד לנוער נתיבות' : 'לא מחובר'}
            </Text>
          </View>
        </View>

        {/* ── Guest prompt ────────────────────────────────────────── */}
        {!isLoggedIn && (
          <View style={styles.guestCard}>
            <View style={styles.guestIconWrap}>
              <Feather name="user-plus" size={28} color={COLORS.gold} />
            </View>
            <Text style={styles.guestTitle}>הצטרף לקהילה</Text>
            <Text style={styles.guestSub}>
              הירשם כדי לקבל RSVP לשיעורים, לכתוב תגובות ועוד
            </Text>
            <View style={styles.guestBtns}>
              <Pressable
                style={styles.loginBtn}
                onPress={() => nav.navigate('Auth', { screen: 'Login' })}
              >
                <Text style={styles.loginBtnText}>התחבר</Text>
              </Pressable>
              <Pressable
                style={styles.registerBtn}
                onPress={() => nav.navigate('Auth', { screen: 'Register' })}
              >
                <Text style={styles.registerBtnText}>הרשמה</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Stats row ──────────────────────────────────────────── */}
        {isLoggedIn && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${COLORS.red}18` }]}>
                <Ionicons name="heart" size={18} color={COLORS.red} />
              </View>
              <Text style={styles.statNum}>{favCount}</Text>
              <Text style={styles.statLabel}>חברותות</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${COLORS.sky}18` }]}>
                <Ionicons name="notifications" size={18} color={COLORS.sky} />
              </View>
              <Text style={styles.statNum}>{notifCount}</Text>
              <Text style={styles.statLabel}>התראות</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: `${COLORS.green}18` }]}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
              </View>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>שיעורים</Text>
            </View>
          </View>
        )}

        {/* ── Profile info card ──────────────────────────────────── */}
        {isLoggedIn && !editing && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>פרטים אישיים</Text>
              <Pressable style={styles.editPill} onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={12} color={COLORS.gold} />
                <Text style={styles.editPillText}>ערוך</Text>
              </Pressable>
            </View>

            {profile ? (
              <>
                <InfoRow icon="user" label="שם פרטי" value={profile.firstName} />
                <InfoRow icon="user-check" label="שם משפחה" value={profile.lastName} />
                <InfoRow icon="phone" label="טלפון" value={profile.phone} />
                <InfoRow icon="users" label="מין" value={profile.gender === 'female' ? 'אישה' : 'גבר'} />
              </>
            ) : (
              <InfoRow icon="user" label="שם" value={displayName} />
            )}
          </View>
        )}

        {/* ── Edit form ─────────────────────────────────────────── */}
        {isLoggedIn && editing && (
          <View style={styles.editCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>עריכת פרופיל</Text>
            </View>

            <View style={styles.inputWrap}>
              <View style={styles.inputIconWrap}>
                <Feather name="user" size={15} color={COLORS.textLight} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="שם תצוגה"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.avatarSectionLabel}>בחר אווטאר</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => (
                <Pressable
                  key={a}
                  style={[styles.avatarOption, selectedAvatar === a && styles.avatarSelected]}
                  onPress={() => setSelectedAvatar(a)}
                >
                  <Text style={styles.avatarOptionText}>{a}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.editActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>ביטול</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Feather name="check" size={15} color="#fff" />
                <Text style={styles.saveText}>שמור שינויים</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Account actions ──────────────────────────────────── */}
        {isLoggedIn && (
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>חשבון</Text>

            <Pressable style={styles.actionRow} onPress={handleLogout}>
              <View style={[styles.actionIconWrap, { backgroundColor: `${COLORS.red}14` }]}>
                <Feather name="log-out" size={16} color={COLORS.red} />
              </View>
              <Text style={styles.actionLabel}>התנתק</Text>
              <Feather name="chevron-left" size={16} color={COLORS.textLight} />
            </Pressable>

            <View style={styles.actionSep} />

            <Pressable
              style={[styles.actionRow, deletingAccount && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: `${COLORS.red}14` }]}>
                {deletingAccount ? (
                  <ActivityIndicator size="small" color={COLORS.red} />
                ) : (
                  <Feather name="trash-2" size={16} color={COLORS.red} />
                )}
              </View>
              <Text style={[styles.actionLabel, { color: COLORS.red }]}>
                {deletingAccount ? 'מוחק חשבון...' : 'מחק חשבון'}
              </Text>
              {!deletingAccount && (
                <Feather name="chevron-left" size={16} color={COLORS.red} style={{ opacity: 0.5 }} />
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ── InfoRow styles ─────────────────────────────────────────────────────────────
const ir = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  value: { fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
});

// ── Main styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { paddingHorizontal: SPACING.md, paddingBottom: 20 },

  // Hero
  heroBanner: {
    marginHorizontal: -SPACING.md,
    backgroundColor: COLORS.navy,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  orbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${COLORS.gold}16`,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.sky}10`,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.navyMid,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    ...SHADOWS.gold,
  },
  avatarEmoji: { fontSize: 48 },
  avatarImage: { width: 96, height: 96, borderRadius: 26 },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.sky,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.navy,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textOnDark,
    marginBottom: SPACING.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${COLORS.gold}20`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.goldLight,
    letterSpacing: 0.3,
  },

  // Guest
  guestCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  guestIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  guestSub: {
    fontSize: 13,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestBtns: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  loginBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.navy,
    ...SHADOWS.sm,
  },
  loginBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  registerBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
    ...SHADOWS.sm,
  },
  registerBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.gold}30`,
  },
  editPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },

  // Edit card
  editCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  inputIconWrap: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: COLORS.textDark,
    paddingRight: 4,
  },
  avatarSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSoft,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldMuted,
  },
  avatarOptionText: { fontSize: 26 },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelText: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: COLORS.navy,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // Actions card
  actionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  actionSep: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
});
