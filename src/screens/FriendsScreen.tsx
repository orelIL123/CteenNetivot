import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

// נתונים לדוגמה - בהמשך יחובר ל-Firebase
const MEMBERS = [
  { id: '1', name: 'יוסף לוי', type: 'חבר' },
  { id: '2', name: 'דוד כהן', type: 'חבר' },
  { id: '3', name: 'מנחם שפירא', type: 'חבר' },
  { id: '4', name: 'אריה גולדברג', type: 'חבר' },
  { id: '5', name: 'שמואל ברגר', type: 'חבר' },
  { id: '6', name: 'רחל כהן', type: 'חברה' },
  { id: '7', name: 'שרה לוי', type: 'חברה' },
  { id: '8', name: 'מיכל גרינברג', type: 'חברה' },
  { id: '9', name: 'אסתר דוד', type: 'חברה' },
  { id: '10', name: 'תמר רוזנברג', type: 'חברה' },
];

function MemberRow({ name, type }: { name: string; type: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, type === 'חברה' ? styles.avatarFemale : styles.avatarMale]}>
        <Text style={styles.avatarText}>{type === 'חברה' ? '👩' : '👦'}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={[styles.badge, type === 'חברה' ? styles.badgeFemale : styles.badgeMale]}>
        <Text style={styles.badgeText}>{type}</Text>
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const males = MEMBERS.filter((m) => m.type === 'חבר');
  const females = MEMBERS.filter((m) => m.type === 'חברה');

  return (
    <View style={styles.wrapper}>
      <TopHeader showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Feather name="users" size={28} color="#fff" /></View>
          <View>
            <Text style={styles.title}>חברים שלנו</Text>
            <Text style={styles.sub}>החברים והחברות של בית חב"ד לנוער נתיבות</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>החברים ({males.length})</Text>
          {males.map((m) => <MemberRow key={m.id} name={m.name} type={m.type} />)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>החברות ({females.length})</Text>
          {females.map((m) => <MemberRow key={m.id} name={m.name} type={m.type} />)}
        </View>

        <View style={styles.note}>
          <Feather name="info" size={18} color={COLORS.skyDark} />
          <Text style={styles.noteText}>בהמשך רשימת החברים תתעדכן אוטומטית מ-Firebase</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.sky,
    marginHorizontal: -16,
    marginTop: -16,
    paddingTop: 56,
    padding: 20,
    paddingBottom: 24,
    marginBottom: 20,
  },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarMale: { backgroundColor: 'rgba(75,191,207,0.2)' },
  avatarFemale: { backgroundColor: 'rgba(232,169,106,0.25)' },
  avatarText: { fontSize: 20 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  badgeMale: { backgroundColor: 'rgba(75,191,207,0.15)' },
  badgeFemale: { backgroundColor: 'rgba(232,169,106,0.2)' },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(75,191,207,0.1)',
    padding: 14,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(75,191,207,0.25)',
  },
  noteText: { fontSize: 13, color: COLORS.textMid, flex: 1 },
});
