import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RABBI } from '../data/content';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { getUpdates, type UpdateDoc } from '../services/firestore';

function UpdateCard({ item, index }: { item: UpdateDoc; index: number }) {
  const hasImage = !!item.imageUrl;

  return (
    <View style={[card.wrap, !hasImage && card.wrapNoImage]}>
      {hasImage && (
        <View style={card.imageWrap}>
          <Image source={{ uri: item.imageUrl }} style={card.image} resizeMode="cover" />
          <View style={card.imageScrim} />
          <View style={card.imageBadge}>
            <Text style={card.imageBadgeText}>#{index + 1}</Text>
          </View>
        </View>
      )}
      <View style={card.body}>
        {!hasImage && (
          <View style={card.textOnlyIcon}>
            <Feather name="file-text" size={18} color={COLORS.gold} />
          </View>
        )}
        <Text style={card.title}>{item.title}</Text>
        {item.body ? <Text style={card.desc}>{item.body}</Text> : null}
      </View>
    </View>
  );
}

export default function UpdatesScreen() {
  const [updates, setUpdates] = useState<UpdateDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpdates().then(setUpdates).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.wrapper}>
      <TopHeader title="עדכונים" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <View style={styles.pageIconWrap}>
              <Feather name="image" size={22} color={COLORS.blue} />
            </View>
            <View>
              <Text style={styles.pageTitle}>עדכונים</Text>
              <Text style={styles.pageSub}>תמונות מפעילויות ושיעורים</Text>
            </View>
          </View>
          {updates.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{updates.length} עדכונים</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.loadingText}>טוען עדכונים...</Text>
          </View>
        ) : updates.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Feather name="image" size={36} color={COLORS.blue} />
            </View>
            <Text style={styles.emptyTitle}>אין עדכונים כרגע</Text>
            <Text style={styles.emptyText}>כאן יופיעו עדכונים עם תמונות ומלל מהרב.</Text>
          </View>
        ) : (
          updates.map((item, i) => (
            <UpdateCard key={item.id} item={item} index={i} />
          ))
        )}

        {/* Contact row */}
        <View style={styles.contactCard}>
          <View style={styles.contactLeft}>
            <View style={styles.locationPin}>
              <Feather name="map-pin" size={16} color={COLORS.red} />
            </View>
            <View>
              <Text style={styles.contactTitle}>בית חב"ד נתיבות</Text>
              <Text style={styles.contactSub}>לפרטים: {RABBI.name}</Text>
            </View>
          </View>
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
    backgroundColor: COLORS.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(42,111,219,0.2)',
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  pageSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  countPill: {
    backgroundColor: COLORS.blueMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(42,111,219,0.2)',
  },
  countPillText: { fontSize: 12, fontWeight: '600', color: COLORS.blue },

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
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 22 },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.sm,
  },
  contactLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  locationPin: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.redMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  contactSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.md,
  },
  wrapNoImage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  imageWrap: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.sand,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  imageBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  body: { padding: SPACING.md },
  textOnlyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 6, lineHeight: 22 },
  desc: { fontSize: 14, color: COLORS.textMid, lineHeight: 22 },
});
