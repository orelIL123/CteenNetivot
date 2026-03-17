import { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ImageBackground, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/firestore';

type Gender = 'male' | 'female';

function Field({
  label, placeholder, value, onChangeText, secureTextEntry, keyboardType, icon,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  icon: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={f.inputWrap}>
        <Feather name={icon as any} size={18} color={COLORS.textLight} style={f.icon} />
        <TextInput
          style={f.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={secureTextEntry || keyboardType === 'phone-pad' ? 'none' : 'words'}
          autoCorrect={false}
          textContentType={secureTextEntry ? 'password' : 'none'}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShow((s) => !s)}
            style={f.eye}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name={show ? 'eye-off' : 'eye'} size={18} color={COLORS.textLight} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneToEmail = (p: string) => {
    const clean = p.replace(/\D/g, '');
    return `${clean}@cteen-netivot.app`;
  };

  const validate = () => {
    if (!firstName.trim()) { Alert.alert('חסר', 'הכנס שם פרטי'); return false; }
    if (!lastName.trim()) { Alert.alert('חסר', 'הכנס שם משפחה'); return false; }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) {
      Alert.alert('חסר', 'הכנס מספר טלפון תקין'); return false;
    }
    if (password.length < 6) { Alert.alert('סיסמה קצרה', 'הסיסמה חייבת להיות לפחות 6 תווים'); return false; }
    if (password !== confirmPassword) { Alert.alert('סיסמה', 'הסיסמאות אינן תואמות'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const email = phoneToEmail(phone);
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const user = await signUp(email, password, displayName);
      await createUserProfile({
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        phone: phone.trim(),
        email,
      });
      // navigate to main app — AuthContext will detect the new user
      nav.reset({ index: 0, routes: [{ name: 'App' }] });
    } catch (e: any) {
      const msg = e?.code === 'auth/email-already-in-use'
        ? 'מספר הטלפון הזה כבר רשום. נסה להתחבר.'
        : e?.message ?? 'שגיאה בהרשמה. נסה שוב.';
      Alert.alert('שגיאה', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/rebbe.jpg')} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.title}>ברוך הבא</Text>
              <Text style={styles.sub}>חב"ד לנוער נתיבות</Text>

              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Field label="שם פרטי" placeholder="ישראל" value={firstName} onChangeText={setFirstName} icon="user" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="שם משפחה" placeholder="ישראלי" value={lastName} onChangeText={setLastName} icon="user" />
                </View>
              </View>

              {/* Gender */}
              <Text style={styles.genderLabel}>מין</Text>
              <View style={styles.genderRow}>
                <Pressable
                  style={[styles.genderBtn, gender === 'male' && styles.genderActive]}
                  onPress={() => setGender('male')}
                >
                  <Text style={styles.genderEmoji}>👦</Text>
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>גבר</Text>
                </Pressable>
                <Pressable
                  style={[styles.genderBtn, gender === 'female' && styles.genderActiveF]}
                  onPress={() => setGender('female')}
                >
                  <Text style={styles.genderEmoji}>👧</Text>
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>אישה</Text>
                </Pressable>
              </View>

              <Field label="טלפון" placeholder="050-0000000" value={phone} onChangeText={setPhone} icon="phone" keyboardType="phone-pad" />
              <Field label="סיסמה" placeholder="לפחות 6 תווים" value={password} onChangeText={setPassword} icon="lock" secureTextEntry />
              <Field label="אימות סיסמה" placeholder="הכנס שוב" value={confirmPassword} onChangeText={setConfirmPassword} icon="lock" secureTextEntry />

              <Pressable
                style={[styles.submitBtn, loading && styles.submitDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>הרשמה</Text>}
              </Pressable>

              <Pressable onPress={() => nav.navigate('Login')}>
                <Text style={styles.link}>כבר יש לך חשבון? התחבר כאן</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(26, 26, 46, 0.75)', justifyContent: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 16, color: '#E8A96A', textAlign: 'center', marginBottom: 24, fontWeight: '600' },
  nameRow: { flexDirection: 'row', gap: 12 },
  genderLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  genderBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.offWhite,
  },
  genderActive: { borderColor: COLORS.sky, backgroundColor: `${COLORS.sky}15` },
  genderActiveF: { borderColor: '#FF6B9D', backgroundColor: '#FF6B9D15' },
  genderEmoji: { fontSize: 18 },
  genderText: { fontSize: 14, fontWeight: '600', color: COLORS.textMid },
  genderTextActive: { color: COLORS.textDark },
  submitBtn: { height: 52, backgroundColor: COLORS.sand, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  submitDisabled: { opacity: 0.7 },
  link: { color: COLORS.textMid, textAlign: 'center', marginTop: 24, fontSize: 14, fontWeight: '500' },
});

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.offWhite, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 46, fontSize: 15, color: COLORS.textDark },
  eye: { padding: 4 },
});
