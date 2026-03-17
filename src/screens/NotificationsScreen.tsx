import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RABBI } from '../data/content';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { getNotifications, type NotificationDoc } from '../services/firestore';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Feather name="bell" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>התראות</Text>
              <Text style={styles.sub}>הודעות מהרב · שיעורים והתראות</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.sky} />
            <Text style={styles.loadingText}>טוען התראות...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="bell" size={40} color={COLORS.skyDark} />
            </View>
            <Text style={styles.emptyTitle}>אין התראות כרגע</Text>
            <Text style={styles.emptyText}>
              כאן יופיעו ההתראות שהרב שולח — למשל "היום ב-9:00 שיעור תניא".
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={styles.cardTime}>
                <Text style={styles.timeText}>{n.time}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                {n.body ? <Text style={styles.cardDesc}>{n.body}</Text> : null}
                <Text style={styles.cardMeta}>{n.date}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.info}>
          <Text style={styles.infoEmoji}>📩</Text>
          <View>
            <Text style={styles.infoTitle}>הרב מנחם ידגר</Text>
            <Text style={styles.infoSub}>ההתראות נשלחות מהרב</Text>
          </View>
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
  header: {
    position: 'relative',
    marginHorizontal: -16,
    marginTop: -16,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 16,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    bottom: 0,
    backgroundColor: '#1a2a4a',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
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
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(75,191,207,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 22 },
  loadingWrap: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.textMid },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
  },
  cardTime: { alignItems: 'center', justifyContent: 'flex-start' },
  timeText: { fontSize: 16, fontWeight: '800', color: COLORS.skyDark },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: COLORS.textMid, lineHeight: 22 },
  cardMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 8 },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoEmoji: { fontSize: 22 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  infoSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});
