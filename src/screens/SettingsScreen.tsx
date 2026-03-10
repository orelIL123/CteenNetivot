import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

export default function SettingsScreen() {
  const nav = useNavigation<any>();

  const items = [
    { icon: 'bell', label: 'התראות', sub: 'הגדרות תזכורות לשיעורים' },
    { icon: 'moon', label: 'מצב כהה', sub: 'להפעיל כשמתאים' },
    { icon: 'globe', label: 'שפה', sub: 'עברית' },
    { icon: 'info', label: 'אודות', sub: 'חב"ד לנוער נתיבות', screen: 'About' },
  ];

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}><Feather name="settings" size={28} color="#fff" /></View>
            <View>
              <Text style={styles.title}>הגדרות</Text>
              <Text style={styles.sub}>התאמת האפליקציה</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          {items.map((item) => (
            <Pressable
              key={item.label}
              style={styles.row}
              onPress={() => { if (item.screen) nav.navigate(item.screen as never); }}
            >
              <View style={styles.rowIcon}><Feather name={item.icon as any} size={20} color={COLORS.skyDark} /></View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowSub}>{item.sub}</Text>
              </View>
              {item.screen && <Feather name="chevron-left" size={18} color={COLORS.textLight} style={{ transform: [{ rotate: '180deg' }] }} />}
            </Pressable>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16, paddingBottom: 20 },
  header: { position: 'relative', marginHorizontal: -16, marginTop: -16, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, marginBottom: 16 },
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: '#2d2d44' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowIcon: { width: 40, height: 40, backgroundColor: 'rgba(75,191,207,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  rowSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});
