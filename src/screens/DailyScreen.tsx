import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { todayStudy } from '../data/content';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { CHABAD_DAILY_LESSONS_URL, fetchDailyLessonsFromApi, DailyLessonItem } from '../services/chabadDailyApi';

// טיפוס חדש לקטגוריה מבוססת API
interface StudySection {
  id: string;
  title: string;
  sub: string;
  emoji: string;
  color: string;
  items: DailyLessonItem[];
}

function StudyCard({ section }: { section: StudySection }) {
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
          {section.items.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={section.color} size="small" />
              <Text style={styles.emptyText}>טוען שיעורים...</Text>
            </View>
          ) : (
            section.items.map((item, i) => (
              <View key={i}>
                <Text style={[styles.itemLabel, { color: section.color }]}>{item.type}</Text>
                <Pressable onPress={() => item.url && WebBrowser.openBrowserAsync(item.url)} style={styles.linkRow}>
                  <Text style={styles.itemText}>{item.title}</Text>
                  <Feather name="external-link" size={14} color={section.color} style={{ marginTop: 4 }} />
                </Pressable>
                {i < section.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function DailyScreen() {
  const [dailyLessonsFromApi, setDailyLessonsFromApi] = useState<DailyLessonItem[]>([]);

  useEffect(() => {
    fetchDailyLessonsFromApi().then((lessons) => {
      if (lessons && lessons.length > 0) setDailyLessonsFromApi(lessons);
    });
  }, []);

  const sections: StudySection[] = [
    {
      id: 'chitas', title: 'חיתת', sub: 'חומש, תהלים, תניא', emoji: '📖', color: COLORS.sand,
      items: dailyLessonsFromApi.filter(l => ['חומש', 'תהלים', 'תניא'].includes(l.type))
    },
    {
      id: 'rambam', title: 'רמב"ם', sub: 'משנה תורה יומי', emoji: '📜', color: COLORS.sky,
      items: dailyLessonsFromApi.filter(l => l.type.includes('רמב"ם') || l.type.includes('ספר המצוות'))
    },
    {
      id: 'hayom', title: 'היום יום', sub: 'מאמר יומי', emoji: '✨', color: '#9B7EC8',
      items: dailyLessonsFromApi.filter(l => l.type === 'היום-יום')
    },
  ];

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

        <Pressable style={styles.chabadLinkCard} onPress={() => WebBrowser.openBrowserAsync(CHABAD_DAILY_LESSONS_URL)}>
          <View style={styles.chabadLinkIcon}><Feather name="external-link" size={24} color={COLORS.sandDark} /></View>
          <View style={styles.chabadLinkText}>
            <Text style={styles.chabadLinkTitle}>לימוד יומי מלא באתר חב"ד</Text>
            <Text style={styles.chabadLinkSub}>לחץ לפתיחת הלימוד המלא והטקסטים באתר chabad.org.il</Text>
          </View>
          <Feather name="chevron-left" size={20} color={COLORS.textLight} />
        </Pressable>

        <View style={styles.tip}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>לחץ על כל קטגוריה כדי לראות את הקישורים לשיעורי היום. כל קישור יפתח את השיעור הרלוונטי באתר חב"ד.</Text>
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
  header: {
    position: 'relative', marginHorizontal: -16, marginTop: -16,
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28, marginBottom: 16,
    zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 8,
  },
  headerBg: {
    position: 'absolute', top: 0, left: -20, right: -20, bottom: 0,
    backgroundColor: '#2d4a3e', borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  intro: {
    backgroundColor: '#fff', padding: 24, borderRadius: 24, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(232,169,106,0.3)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  quote: { fontSize: 17, fontStyle: 'italic', color: COLORS.textDark, textAlign: 'center' },
  source: { fontSize: 12, color: COLORS.textLight, marginTop: 8, textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 24, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  cardMeta: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  cardSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  cardBody: { paddingHorizontal: 18, paddingBottom: 18 },
  itemLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  linkRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  itemText: { flex: 1, fontSize: 15, lineHeight: 22, color: COLORS.textMid },
  emptyState: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 13, color: COLORS.textLight },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  chabadLinkCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20,
    borderRadius: 24, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(232,169,106,0.35)', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
  },
  chabadLinkIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${COLORS.sand}30`, alignItems: 'center', justifyContent: 'center' },
  chabadLinkText: { flex: 1 },
  chabadLinkTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  chabadLinkSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 16, backgroundColor: 'rgba(75,191,207,0.06)', borderRadius: BORDER_RADIUS.sm, marginTop: 8 },
  tipEmoji: { fontSize: 18 },
  tipText: { fontSize: 13, color: COLORS.textMid, flex: 1 },
});
