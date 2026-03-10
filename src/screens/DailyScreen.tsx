import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { todayStudy } from '../data/content';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

const sections = [
  { id: 'chitas', title: 'חיתת', sub: 'חומש, תהלים, תניא', emoji: '📖', color: COLORS.sand, items: [
    { label: `חומש — ${todayStudy.chitas.chumash.portion}`, text: todayStudy.chitas.chumash.text },
    { label: `תהלים — ${todayStudy.chitas.tehillim.chapter}`, text: todayStudy.chitas.tehillim.text },
    { label: `תניא — ${todayStudy.chitas.tanya.section}`, text: todayStudy.chitas.tanya.text },
  ]},
  { id: 'rambam', title: 'רמב"ם', sub: 'משנה תורה יומי', emoji: '📜', color: COLORS.sky, items: [
    { label: todayStudy.rambam.chapter, text: todayStudy.rambam.text },
  ]},
  { id: 'hayom', title: 'היום יום', sub: 'מאמר יומי', emoji: '✨', color: '#9B7EC8', items: [
    { label: todayStudy.hebrewDate, text: todayStudy.hayomYom.text },
  ]},
];

function StudyCard({ section }: { section: typeof sections[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable style={styles.cardHeader} onPress={() => setOpen(!open)}>
        <View style={[styles.cardIcon, { backgroundColor: `${section.color}20` }]}>
          <Text style={styles.emoji}>{section.emoji}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardSub}>{section.sub}</Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={section.color} />
      </Pressable>
      {open && (
        <View style={styles.cardBody}>
          {section.items.map((item, i) => (
            <View key={i}>
              <Text style={[styles.itemLabel, { color: section.color }]}>{item.label}</Text>
              <Text style={styles.itemText}>{item.text}</Text>
              {i < section.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DailyScreen() {
  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><Feather name="book-open" size={28} color="#fff" /></View>
          <View>
            <Text style={styles.title}>לימוד יומי</Text>
            <Text style={styles.sub}>{todayStudy.hebrewDate} · {todayStudy.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.quote}>"לימוד התורה שקול כנגד כל המצוות"</Text>
        <Text style={styles.source}>— תלמוד ירושלמי</Text>
      </View>

      {sections.map((s) => <StudyCard key={s.id} section={s} />)}

      <View style={styles.tip}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={styles.tipText}>לחץ על כל קטגוריה כדי לקרוא את הלימוד של היום. בהמשך יתחבר לאתר חב"ד לנוסח המלא.</Text>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16, paddingBottom: 20 },
  header: { position: 'relative', marginHorizontal: -16, marginTop: -16, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, marginBottom: 16 },
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: '#2d4a3e' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  intro: { backgroundColor: '#fff', padding: 20, borderRadius: BORDER_RADIUS.md, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(232,169,106,0.2)' },
  quote: { fontSize: 17, fontStyle: 'italic', color: COLORS.textDark, textAlign: 'center' },
  source: { fontSize: 12, color: COLORS.textLight, marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  cardSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  cardBody: { paddingHorizontal: 18, paddingBottom: 18 },
  itemLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  itemText: { fontSize: 15, lineHeight: 26, color: COLORS.textMid },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 16, backgroundColor: 'rgba(75,191,207,0.06)', borderRadius: BORDER_RADIUS.sm, marginTop: 8 },
  tipEmoji: { fontSize: 18 },
  tipText: { fontSize: 13, color: COLORS.textMid, flex: 1 },
});
