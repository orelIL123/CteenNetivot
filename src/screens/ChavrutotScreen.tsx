import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { getChavrutot, type ChavrutaDoc } from '../services/firestore';
import { RABBI } from '../data/content';
import { useAppStore } from '../store/appStore';

const LEVEL_CONFIG: Record<string, { color: string; icon: string }> = {
  'מתחיל': { color: COLORS.green, icon: 'star-outline' },
  'בינוני': { color: COLORS.sky, icon: 'star-half-outline' },
  'מתקדם': { color: COLORS.gold, icon: 'star' },
};

function ChavrutaCard({ c }: { c: ChavrutaDoc }) {
  const { favoriteChavruta, toggleFavoriteChavruta } = useAppStore();
  const fav = favoriteChavruta.includes(c.id);
  const levelCfg = LEVEL_CONFIG[c.level] ?? { color: COLORS.sky, icon: 'star-outline' };

  return (
    <View style={styles.card}>
      {/* Top section */}
      <View style={styles.cardTop}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarEmoji}>{c.avatar || '🧑'}</Text>
          <View style={[styles.levelDot, { backgroundColor: levelCfg.color }]} />
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{c.name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: `${levelCfg.color}18` }]}>
              <Ionicons name={levelCfg.icon as any} size={11} color={levelCfg.color} />
              <Text style={[styles.levelText, { color: levelCfg.color }]}>{c.level}</Text>
            </View>
          </View>
          <Text style={styles.ageLine}>גיל {c.age}</Text>
          {c.bio ? <Text style={styles.bio} numberOfLines={2}>{c.bio}</Text> : null}
        </View>

        <Pressable
          style={[styles.favBtn, fav && styles.favBtnActive]}
          onPress={() => toggleFavoriteChavruta(c.id)}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={16}
            color={fav ? COLORS.red : COLORS.textLight}
          />
        </Pressable>
      </View>

      {/* Subjects */}
      {c.subjects?.length > 0 && (
        <View style={styles.subjectsRow}>
          {c.subjects.map((s) => (
            <View key={s} style={styles.subjectTag}>
              <Feather name="book-open" size={10} color={COLORS.skyDark} />
              <Text style={styles.subjectText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Availability */}
      {c.availability?.length > 0 && (
        <View style={styles.availRow}>
          <Feather name="calendar" size={12} color={COLORS.textLight} />
          <Text style={styles.availLabel}>זמינות:</Text>
          {c.availability.map((d) => (
            <View key={d} style={styles.dayTag}>
              <Text style={styles.dayText}>{d}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Contact button */}
      <Pressable
        style={styles.contactBtn}
        onPress={() => Alert.alert('בקשת חברותא', `נשלחה ל${c.name}! בבחירה יפתחו שעות זמינות.`)}
      >
        <Feather name="message-circle" size={15} color="#fff" />
        <Text style={styles.contactText}>שלח בקשת חברותא</Text>
      </Pressable>
    </View>
  );
}

export default function ChavrutotScreen() {
  const [list, setList] = useState<ChavrutaDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChavrutot().then(setList).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.wrapper}>
      <TopHeader title="חברותא" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <View style={styles.pageIconWrap}>
              <Feather name="users" size={22} color={COLORS.green} />
            </View>
            <View>
              <Text style={styles.pageTitle}>חברותא</Text>
              <Text style={styles.pageSub}>מצא חברותא ללימוד · חבדניקים</Text>
            </View>
          </View>
          {list.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{list.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.loadingText}>טוען...</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Feather name="users" size={40} color={COLORS.green} />
            </View>
            <Text style={styles.emptyTitle}>אין עדיין חבדניקים ברשימה</Text>
            <Text style={styles.emptyText}>
              בהמשך יופיעו כאן אנשים ללימוד חברותא — ובבחירה יפתחו שעות שהם זמינים.
            </Text>
          </View>
        ) : (
          list.map((c) => <ChavrutaCard key={c.id} c={c} />)
        )}

        {/* Join banner */}
        <View style={styles.joinBanner}>
          <View style={styles.joinLeft}>
            <View style={styles.joinIcon}>
              <Feather name="user-plus" size={18} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.joinTitle}>רוצה להצטרף לרשימה?</Text>
              <Text style={styles.joinSub}>פנה ל{RABBI.name} להוספת פרטיך</Text>
            </View>
          </View>
          <Pressable
            style={styles.joinBtn}
            onPress={() => Alert.alert('הצטרף', `צור קשר עם ${RABBI.name}`)}
          >
            <Text style={styles.joinBtnText}>הצטרף</Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { padding: SPACING.md, paddingBottom: 20 },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  pageHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  pageIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.greenMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,169,107,0.2)',
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  pageSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  countPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.greenMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45,169,107,0.25)',
  },
  countPillText: { fontSize: 13, fontWeight: '700', color: COLORS.green },

  loadingWrap: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textMid },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: COLORS.greenMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textMid, lineHeight: 22, textAlign: 'center' },

  // Chavruta card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.md },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.parchment,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  avatarEmoji: { fontSize: 24 },
  levelDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap', marginBottom: 3 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  levelText: { fontSize: 11, fontWeight: '600' },
  ageLine: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  bio: { fontSize: 12, color: COLORS.textSoft, lineHeight: 18 },
  favBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  favBtnActive: {
    backgroundColor: COLORS.redMuted,
    borderColor: 'rgba(217,69,59,0.3)',
  },

  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: SPACING.sm },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: COLORS.skyMuted,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(58,191,207,0.2)',
  },
  subjectText: { fontSize: 11, fontWeight: '500', color: COLORS.skyDark },

  availRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  availLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
  dayTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.cream,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  dayText: { fontSize: 11, fontWeight: '500', color: COLORS.textMid },

  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 12,
    backgroundColor: COLORS.green,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  contactText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  joinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.18)',
    ...SHADOWS.sm,
  },
  joinLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  joinIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  joinSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
