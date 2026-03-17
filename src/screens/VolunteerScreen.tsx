import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  getVolunteerRequests, volunteerForRequest,
  type VolunteerRequestDoc,
} from '../services/firestore';

// ─── Volunteer card ───────────────────────────────────────────────────────────
function VolunteerCard({
  req,
  onVolunteer,
  onVolunteerAnon,
  hasVolunteered,
}: {
  req: VolunteerRequestDoc;
  onVolunteer: (id: string) => void;
  onVolunteerAnon: (id: string) => void;
  hasVolunteered: boolean;
}) {
  const total = req.volunteerUids.length + req.anonymousCount;
  const spotsLeft = Math.max(0, req.spotsNeeded - total);
  const progress = req.spotsNeeded > 0 ? Math.min(1, total / req.spotsNeeded) : 0;
  const isFull = spotsLeft === 0;

  return (
    <View style={card.wrap}>
      {/* Header strip */}
      <View style={[card.strip, isFull && card.stripFull]} />

      <View style={card.inner}>
        {/* Title + badge */}
        <View style={card.titleRow}>
          <Text style={card.title} numberOfLines={2}>{req.title}</Text>
          <View style={[card.badge, isFull ? card.badgeFull : spotsLeft <= 2 ? card.badgeUrgent : card.badgeOpen]}>
            <Text style={card.badgeText}>
              {isFull ? 'מלא' : `נותרו ${spotsLeft}`}
            </Text>
          </View>
        </View>

        {/* Body */}
        {req.body ? (
          <Text style={card.body}>{req.body}</Text>
        ) : null}

        {/* Progress bar */}
        <View style={card.progressWrap}>
          <View style={card.progressTrack}>
            <View style={[card.progressFill, { width: `${progress * 100}%` as any }, isFull && card.progressFillFull]} />
          </View>
          <Text style={card.progressLabel}>
            {total} / {req.spotsNeeded} מתנדבים
          </Text>
        </View>

        {/* Stats row */}
        <View style={card.statsRow}>
          {req.volunteerUids.length > 0 && (
            <View style={card.stat}>
              <Ionicons name="people" size={13} color={COLORS.sandDark} />
              <Text style={card.statText}>{req.volunteerUids.length} נרשמו בשמם</Text>
            </View>
          )}
          {req.anonymousCount > 0 && (
            <View style={card.stat}>
              <Ionicons name="person" size={13} color={COLORS.textLight} />
              <Text style={card.statText}>{req.anonymousCount} אנונימיים</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        {hasVolunteered ? (
          <View style={card.volunteeredBanner}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
            <Text style={card.volunteeredText}>נרשמת! תודה רבה 🙏</Text>
          </View>
        ) : isFull ? (
          <View style={card.fullBanner}>
            <Ionicons name="people-circle" size={18} color={COLORS.textLight} />
            <Text style={card.fullText}>המשבצות מלאו — תודה לכולם!</Text>
          </View>
        ) : (
          <View style={card.actions}>
            <Pressable
              style={[card.btn, card.btnAnon]}
              onPress={() => onVolunteerAnon(req.id)}
            >
              <Ionicons name="person-outline" size={16} color={COLORS.textMid} />
              <Text style={card.btnAnonText}>אנונימי</Text>
            </Pressable>
            <Pressable
              style={[card.btn, card.btnNamed]}
              onPress={() => onVolunteer(req.id)}
            >
              <Ionicons name="heart" size={16} color="#fff" />
              <Text style={card.btnNamedText}>אני מתנדב/ת!</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VolunteerScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<VolunteerRequestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Track which request IDs the current user has volunteered for
  const [volunteeredIds, setVolunteeredIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const list = await getVolunteerRequests();
    setRequests(list.filter((r) => r.active));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sync volunteeredIds from loaded data when user is known
  useEffect(() => {
    if (user && requests.length) {
      const myIds = new Set(
        requests
          .filter((r) => r.volunteerUids.includes(user.uid))
          .map((r) => r.id)
      );
      setVolunteeredIds(myIds);
    }
  }, [user, requests]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleVolunteer = async (requestId: string) => {
    if (!user) {
      Alert.alert('יש להתחבר', 'עליך להתחבר כדי להתנדב');
      return;
    }
    const ok = await volunteerForRequest(requestId, user.uid, false);
    if (ok) {
      setVolunteeredIds((prev) => new Set([...prev, requestId]));
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, volunteerUids: [...r.volunteerUids, user.uid] }
            : r
        )
      );
      Alert.alert('תודה!', 'נרשמת בהצלחה כמתנדב/ת 🙏');
    } else {
      Alert.alert('שגיאה', 'לא הצלחנו לרשום אותך. נסה שוב.');
    }
  };

  const handleVolunteerAnon = async (requestId: string) => {
    const ok = await volunteerForRequest(requestId, user?.uid ?? 'anon', true);
    if (ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, anonymousCount: r.anonymousCount + 1 }
            : r
        )
      );
      Alert.alert('תודה!', 'נרשמת כמתנדב/ת באנונימיות 🙏');
    } else {
      Alert.alert('שגיאה', 'לא הצלחנו לרשום. נסה שוב.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.red} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="heart" size={30} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>התנדבות</Text>
              <Text style={styles.sub}>הרב מנחם מעלה בקשות — כולם יכולים לאשר</Text>
            </View>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatNum}>{requests.length}</Text>
              <Text style={styles.headerStatLabel}>בקשות פעילות</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatNum}>
                {requests.reduce((acc, r) => acc + r.volunteerUids.length + r.anonymousCount, 0)}
              </Text>
              <Text style={styles.headerStatLabel}>מתנדבים</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={styles.loadingText}>טוען בקשות...</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={44} color={COLORS.red} />
            </View>
            <Text style={styles.emptyTitle}>אין בקשות התנדבות כרגע</Text>
            <Text style={styles.emptyText}>
              כשהרב יעלה הודעה (למשל "צריך מתנדב לרכישת מצרכים"), תוכל/י לאשר כאן — גם באנונימי וגם בגלוי.
            </Text>
            <Pressable style={styles.refreshBtn} onPress={() => load()}>
              <Ionicons name="refresh" size={16} color={COLORS.textMid} />
              <Text style={styles.refreshText}>רענן</Text>
            </Pressable>
          </View>
        ) : (
          requests.map((req) => (
            <VolunteerCard
              key={req.id}
              req={req}
              onVolunteer={handleVolunteer}
              onVolunteerAnon={handleVolunteerAnon}
              hasVolunteered={volunteeredIds.has(req.id)}
            />
          ))
        )}

        {/* Info footer */}
        {!loading && requests.length > 0 && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.sandDark} />
            <Text style={styles.infoText}>
              ניתן להתנדב בגלוי (שמך יישמר) או באנונימי (לא נגלה מי). שתי האפשרויות מצוינות!
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16, paddingBottom: 20 },
  // Header
  header: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
    position: 'relative',
  },
  headerBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#C45C5C',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  headerIcon: {
    width: 52, height: 52,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    gap: 0,
  },
  headerStat: { flex: 1, alignItems: 'center' },
  headerStatNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  headerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  // Loading
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textLight },
  // Empty
  emptyState: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 72, height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(196,92,92,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: COLORS.offWhite, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  refreshText: { fontSize: 14, color: COLORS.textMid, fontWeight: '500' },
  // Info footer
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(232,169,106,0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,169,106,0.2)',
    marginBottom: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.textMid, lineHeight: 20 },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    // Android elevation
    elevation: 2,
  },
  strip: {
    height: 4,
    backgroundColor: COLORS.red,
  },
  stripFull: {
    backgroundColor: COLORS.green,
  },
  inner: {
    padding: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  badgeOpen: { backgroundColor: 'rgba(75,191,207,0.15)' },
  badgeUrgent: { backgroundColor: 'rgba(232,169,106,0.2)' },
  badgeFull: { backgroundColor: 'rgba(52,199,89,0.15)' },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.textMid },
  body: {
    fontSize: 14,
    color: COLORS.textMid,
    lineHeight: 22,
    marginBottom: 14,
  },
  // Progress
  progressWrap: {
    marginBottom: 12,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.red,
    borderRadius: 3,
  },
  progressFillFull: {
    backgroundColor: COLORS.green,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: { fontSize: 12, color: COLORS.textLight },
  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
  },
  btnAnon: {
    backgroundColor: COLORS.offWhite,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnAnonText: { fontSize: 14, fontWeight: '600', color: COLORS.textMid },
  btnNamed: { backgroundColor: COLORS.red },
  btnNamedText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  // Volunteered banner
  volunteeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(52,199,89,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.2)',
  },
  volunteeredText: { fontSize: 14, fontWeight: '600', color: COLORS.green },
  // Full banner
  fullBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.offWhite,
    borderRadius: 12,
  },
  fullText: { fontSize: 14, fontWeight: '500', color: COLORS.textLight },
});
