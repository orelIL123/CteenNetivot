import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

function Field({
  label, placeholder, value, onChangeText, secureTextEntry, keyboardType, icon,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad';
  icon: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.inputWrap, focused && f.inputFocused]}>
        <View style={f.iconWrap}>
          <Feather name={icon as any} size={16} color={focused ? COLORS.gold : COLORS.textLight} />
        </View>
        <TextInput
          style={f.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType={secureTextEntry ? 'password' : 'none'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShow((s) => !s)}
            style={f.eye}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name={show ? 'eye-off' : 'eye'} size={16} color={COLORS.textLight} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { signIn, signInAnonymously } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneToEmail = (p: string) => {
    const clean = p.replace(/\D/g, '');
    return `${clean}@cteen-netivot.app`;
  };

  const handleLogin = async () => {
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      Alert.alert('חסר', 'הכנס מספר טלפון תקין');
      return;
    }
    if (!password) {
      Alert.alert('חסר', 'הכנס סיסמה');
      return;
    }
    setLoading(true);
    try {
      const email = phoneToEmail(phone);
      await signIn(email, password);
      nav.reset({ index: 0, routes: [{ name: 'App' }] });
    } catch (e: any) {
      const code = e?.code ?? '';
      let msg = 'שגיאה בהתחברות. נסה שוב.';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'מספר טלפון או סיסמה שגויים.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'יותר מדי ניסיונות. נסה שוב מאוחר יותר.';
      }
      Alert.alert('שגיאה', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background layers */}
      <Image
        source={require('../../assets/rebbe.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.overlayGradientTop} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand header */}
          <View style={styles.brandBlock}>
            <View style={styles.logoRing}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.appName}>חב"ד לנוער נתיבות</Text>
            <Text style={styles.appSub}>CTeen Netivot</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Card header accent */}
            <View style={styles.cardAccent} />

            <Text style={styles.cardTitle}>ברוך הבא</Text>
            <Text style={styles.cardSub}>התחבר עם מספר הטלפון שלך</Text>

            <Field
              label="מספר טלפון"
              placeholder="050-0000000"
              value={phone}
              onChangeText={setPhone}
              icon="phone"
              keyboardType="phone-pad"
            />
            <Field
              label="סיסמה"
              placeholder="הכנס סיסמה"
              value={password}
              onChangeText={setPassword}
              icon="lock"
              secureTextEntry
            />

            <Pressable
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.loginBtnText}>התחבר</Text>
                  <View style={styles.btnArrow}>
                    <Feather name="arrow-left" size={16} color={COLORS.gold} />
                  </View>
                </View>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>או</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.registerBtn} onPress={() => nav.navigate('Register')}>
              <Text style={styles.registerBtnText}>אין לך חשבון? </Text>
              <Text style={styles.registerBtnLink}>הירשם כאן</Text>
            </Pressable>

            <Pressable
              style={styles.guestBtn}
              onPress={async () => {
                setLoading(true);
                try {
                  await signInAnonymously();
                  nav.reset({ index: 0, routes: [{ name: 'App' }] });
                } catch (e: any) {
                  Alert.alert('שגיאה', e?.message ?? 'לא ניתן להיכנס כאורח');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <Feather name="user" size={14} color={COLORS.textLight} />
              <Text style={styles.guestBtnText}>המשך כאורח</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.navy },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,18,36,0.72)',
  },
  overlayGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(14,18,36,0.45)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },

  brandBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...SHADOWS.gold,
  },
  logo: { width: 60, height: 60, borderRadius: 14 },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textOnDark,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 13,
    color: COLORS.goldLight,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.gold,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    marginTop: 8,
  },
  cardSub: {
    fontSize: 14,
    color: COLORS.textSoft,
    marginBottom: 24,
  },

  loginBtn: {
    height: 52,
    backgroundColor: COLORS.navy,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.md,
  },
  btnDisabled: { opacity: 0.65 },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(212,165,74,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  dividerText: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },

  registerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.cream,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 12,
  },
  registerBtnText: { fontSize: 14, color: COLORS.textSoft },
  registerBtnLink: { fontSize: 14, fontWeight: '700', color: COLORS.gold },

  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  guestBtnText: { fontSize: 13, color: COLORS.textLight },
});

const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSoft,
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.parchment,
  },
  iconWrap: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.textDark, paddingRight: 4 },
  eye: { padding: 10 },
});
