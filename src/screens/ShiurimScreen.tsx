import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';
import {
  getShiurim, toggleRsvp, toggleLike,
  getShiurComments, addShiurComment,
  type ShiurDoc, type ShiurCommentDoc,
} from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/appStore';

const CATEGORY_COLORS: Record<string, string> = {
  tanya: COLORS.gold,
  parasha: COLORS.sky,
  halacha: COLORS.green,
  chassidut: COLORS.purple,
  general: COLORS.orange,
};
const CATEGORY_LABELS: Record<string, string> = {
  tanya: 'תניא',
  parasha: 'פרשה',
  halacha: 'הלכה',
  chassidut: 'חסידות',
  general: 'כללי',
};

function CommentSection({ shiur, uid, displayName }: {
  shiur: ShiurDoc; uid: string; displayName: string;
}) {
  const [comments, setComments] = useState<ShiurCommentDoc[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getShiurComments(shiur.id);
    setComments(list);
    setLoading(false);
  }, [shiur.id]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await addShiurComment(shiur.id, { uid, displayName, text: text.trim() });
    setText('');
    await load();
    setSending(false);
  };

  return (
    <View style={cs.wrap}>
      <Pressable style={cs.toggle} onPress={() => setOpen(!open)}>
        <View style={cs.toggleIcon}>
          <Feather name="message-circle" size={14} color={COLORS.textLight} />
        </View>
        <Text style={cs.toggleText}>
          {open ? 'סגור תגובות' : `תגובות${comments.length > 0 && !open ? ` (${comments.length})` : ''}`}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.textLight} />
      </Pressable>

      {open && (
        <View style={cs.body}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.gold} style={{ marginVertical: 10 }} />
          ) : comments.length === 0 ? (
            <Text style={cs.empty}>אין תגובות עדיין — היה הראשון! 💬</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={cs.comment}>
                <View style={cs.commentAvatar}>
                  <Text style={cs.commentAvatarText}>{c.displayName.charAt(0)}</Text>
                </View>
                <View style={cs.commentContent}>
                  <Text style={cs.commentName}>{c.displayName}</Text>
                  <Text style={cs.commentText}>{c.text}</Text>
                </View>
              </View>
            ))
          )}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={cs.inputRow}>
              <TextInput
                style={cs.input}
                placeholder="כתוב תגובה..."
                placeholderTextColor={COLORS.textLight}
                value={text}
                onChangeText={setText}
                returnKeyType="send"
                onSubmitEditing={send}
              />
              <Pressable
                style={[cs.sendBtn, (!text.trim() || sending) && cs.sendDisabled]}
                onPress={send}
                disabled={!text.trim() || sending}
              >
                <Feather name="send" size={16} color="#fff" />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

function ShiurCard({ shiur, uid, displayName, onRefresh }: {
  shiur: ShiurDoc; uid: string; displayName: string; onRefresh: () => void;
}) {
  const isRsvped = shiur.rsvpUids.includes(uid);
  const isLiked = shiur.likeUids.includes(uid);
  const color = CATEGORY_COLORS[shiur.category] ?? COLORS.gold;

  const handleRsvp = async () => {
    if (!uid) { Alert.alert('נדרשת התחברות'); return; }
    await toggleRsvp(shiur.id, uid, isRsvped);
    onRefresh();
  };

  const handleLike = async () => {
    if (!uid) { Alert.alert('נדרשת התחברות'); return; }
    await toggleLike(shiur.id, uid, isLiked);
    onRefresh();
  };

  return (
    <View style={sc.card}>
      {/* Color accent bar */}
      <View style={[sc.accentBar, { backgroundColor: color }]} />

      <View style={sc.cardInner}>
        <View style={sc.cardTop}>
          <View style={[sc.categoryBadge, { backgroundColor: `${color}18` }]}>
            <Text style={[sc.categoryText, { color }]}>{CATEGORY_LABELS[shiur.category] ?? shiur.category}</Text>
          </View>
          <View style={sc.timeBadge}>
            <Feather name="clock" size={11} color={COLORS.textLight} />
            <Text style={sc.timeText}>{shiur.day} · {shiur.time}</Text>
          </View>
        </View>

        <Text style={sc.title}>{shiur.title}</Text>
        {shiur.description ? <Text style={sc.desc}>{shiur.description}</Text> : null}

        <View style={sc.metaRow}>
          <View style={sc.metaItem}>
            <Feather name="user" size={12} color={COLORS.textLight} />
            <Text style={sc.metaText}>{shiur.teacher}</Text>
          </View>
          <View style={sc.metaDot} />
          <View style={sc.metaItem}>
            <Feather name="map-pin" size={12} color={COLORS.textLight} />
            <Text style={sc.metaText}>{shiur.location}</Text>
          </View>
        </View>

        <View style={sc.actions}>
          <Pressable style={[sc.rsvpBtn, isRsvped && sc.rsvpActive]} onPress={handleRsvp}>
            <Feather name="check-circle" size={15} color={isRsvped ? '#fff' : COLORS.green} />
            <Text style={[sc.rsvpText, isRsvped && { color: '#fff' }]}>
              {isRsvped ? 'אני בא ✓' : 'אני בא'}
            </Text>
            {shiur.rsvpUids.length > 0 && (
              <View style={[sc.countBadge, isRsvped && sc.countBadgeActive]}>
                <Text style={[sc.countText, isRsvped && { color: COLORS.green }]}>
                  {shiur.rsvpUids.length}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable style={[sc.likeBtn, isLiked && sc.likeActive]} onPress={handleLike}>
            <Feather name="heart" size={15} color={isLiked ? '#fff' : COLORS.red} />
            {shiur.likeUids.length > 0 && (
              <Text style={[sc.likeCount, isLiked && { color: '#fff' }]}>{shiur.likeUids.length}</Text>
            )}
          </Pressable>
        </View>

        <CommentSection shiur={shiur} uid={uid} displayName={displayName} />
      </View>
    </View>
  );
}

export default function ShiurimScreen() {
  const { user } = useAuth();
  const { userName } = useAppStore();
  const uid = user?.uid ?? '';
  const displayName = userName || 'אורח';
  const [shiurim, setShiurim] = useState<ShiurDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const list = await getShiurim();
    setShiurim(list.filter((s) => s.active));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.wrapper}>
      <TopHeader title="שיעורים" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageHeaderLeft}>
            <View style={styles.pageIconWrap}>
              <Feather name="book" size={22} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.pageTitle}>שיעורים</Text>
              <Text style={styles.pageSub}>לחץ "אני בא" להגיב לשיעור</Text>
            </View>
          </View>
          {shiurim.length > 0 && (
            <View style={styles.countBubble}>
              <Text style={styles.countBubbleText}>{shiurim.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>טוען שיעורים...</Text>
          </View>
        ) : shiurim.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="book" size={36} color={COLORS.gold} />
            </View>
            <Text style={styles.emptyTitle}>אין שיעורים כרגע</Text>
            <Text style={styles.emptyText}>הרב יוסיף שיעורים ממסך הניהול.</Text>
          </View>
        ) : (
          shiurim.map((s) => (
            <ShiurCard key={s.id} shiur={s} uid={uid} displayName={displayName} onRefresh={load} />
          ))
        )}
        <View style={{ height: 100 }} />
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
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.25)',
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark },
  pageSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  countBubble: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  countBubbleText: { fontSize: 13, fontWeight: '700', color: '#fff' },

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
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center' },
});

const sc = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.md,
  },
  accentBar: {
    width: 4,
    borderRadius: 2,
    minHeight: '100%',
  },
  cardInner: { flex: 1, padding: SPACING.md },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: { fontSize: 11, fontWeight: '700' },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  timeText: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },

  title: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 6, lineHeight: 24 },
  desc: { fontSize: 13, color: COLORS.textSoft, lineHeight: 20, marginBottom: SPACING.sm },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textLight },
  metaText: { fontSize: 12, color: COLORS.textLight },

  actions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },

  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.green,
    backgroundColor: 'transparent',
  },
  rsvpActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  rsvpText: { fontSize: 13, fontWeight: '700', color: COLORS.green },
  countBadge: {
    backgroundColor: COLORS.greenMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: { fontSize: 11, fontWeight: '700', color: COLORS.green },

  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    backgroundColor: 'transparent',
  },
  likeActive: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  likeCount: { fontSize: 13, fontWeight: '700', color: COLORS.red },
});

const cs = StyleSheet.create({
  wrap: { marginTop: SPACING.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.cream,
    borderRadius: BORDER_RADIUS.xs,
  },
  toggleIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontSize: 12, color: COLORS.textLight, flex: 1, fontWeight: '500' },
  body: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: SPACING.sm,
  },
  empty: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', paddingVertical: 10 },
  comment: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.2)',
  },
  commentAvatarText: { fontSize: 13, fontWeight: '700', color: COLORS.gold },
  commentContent: { flex: 1 },
  commentName: { fontSize: 11, fontWeight: '700', color: COLORS.gold, marginBottom: 2 },
  commentText: { fontSize: 13, color: COLORS.textMid, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.cream,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.sky,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  sendDisabled: { opacity: 0.35 },
});
