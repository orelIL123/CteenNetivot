import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { COLORS, BORDER_RADIUS } from '../constants/theme';

export default function AdminScreen() {
  return (
    <View style={styles.wrapper}>
      <TopHeader showBack />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Feather name="shield" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>מסך ניהול</Text>
          <Text style={styles.sub}>להרב מנחם ידגר</Text>
        </View>

        <View style={styles.card}>
          <Feather name="tool" size={24} color={COLORS.skyDark} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>בהמשך</Text>
            <Text style={styles.cardText}>
              כאן יופיעו כלי הניהול: עדכון שיעורים, התראות, רשימת חברים, תוכן האפליקציה ועוד.
            </Text>
          </View>
        </View>

        <View style={styles.note}>
          <Feather name="database" size={20} color={COLORS.sandDark} />
          <Text style={styles.noteText}>יחובר ל-Firebase Admin עם הרשאות לרב</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite, padding: 20 },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    marginBottom: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  sub: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
    alignItems: 'flex-start',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  cardText: { fontSize: 14, color: COLORS.textMid, lineHeight: 22 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(232,169,106,0.12)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(232,169,106,0.25)',
  },
  noteText: { fontSize: 13, color: COLORS.textMid, flex: 1 },
});
