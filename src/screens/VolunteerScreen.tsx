import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

// בקשת התנדבות שהרב מעלה — "צריך מתנדב לרכישת מצרכים" וכו'
export interface VolunteerRequest {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  volunteerCount: number;
  anonymousCount: number;
}

export default function VolunteerScreen() {
  // ייטען מ-Firebase — הרב מעלה הודעות "צריך מתנדב ל־..."
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);

  const handleVolunteer = (id: string, anonymous: boolean) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              volunteerCount: r.volunteerCount + (anonymous ? 0 : 1),
              anonymousCount: r.anonymousCount + (anonymous ? 1 : 0),
            }
          : r
      )
    );
    Alert.alert('תודה!', anonymous ? 'נרשמת כמתנדב/ת באנונימיות.' : 'נרשמת כמתנדב/ת. יופי!');
  };

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Feather name="heart" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>התנדבות</Text>
              <Text style={styles.sub}>צריך מתנדב? הרב מעלה הודעה — כולם יכולים לאשר</Text>
            </View>
          </View>
        </View>

        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="heart" size={40} color="#E07B7B" />
            </View>
            <Text style={styles.emptyTitle}>אין בקשות התנדבות כרגע</Text>
            <Text style={styles.emptyText}>
              כשהרב יעלה הודעה (למשל "צריך מתנדב לרכישת מצרכים"), תוכל/י לאשר כאן — גם באנונימי וגם בגלוי. זה מוריד מהרב לחץ!
            </Text>
          </View>
        ) : (
          requests.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <Text style={styles.cardBody}>{r.body}</Text>
              <View style={styles.stats}>
                <Text style={styles.statsText}>
                  {r.volunteerCount + r.anonymousCount} מתנדבים ({r.anonymousCount} אנונימיים)
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.btn, styles.btnAnonymous]}
                  onPress={() => handleVolunteer(r.id, true)}
                >
                  <Feather name="user" size={18} color="#fff" />
                  <Text style={styles.btnText}>אני מתנדב/ת (אנונימי)</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.btnNamed]}
                  onPress={() => handleVolunteer(r.id, false)}
                >
                  <Feather name="user" size={18} color="#fff" />
                  <Text style={styles.btnText}>אני מתנדב/ת</Text>
                </Pressable>
              </View>
            </View>
          ))
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
    backgroundColor: '#C45C5C',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
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
    backgroundColor: 'rgba(224,123,123,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textMid, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  cardBody: { fontSize: 15, color: COLORS.textMid, lineHeight: 24, marginBottom: 12 },
  stats: { marginBottom: 14 },
  statsText: { fontSize: 13, color: COLORS.textLight },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
  },
  btnAnonymous: { backgroundColor: COLORS.textLight },
  btnNamed: { backgroundColor: '#E07B7B' },
  btnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
