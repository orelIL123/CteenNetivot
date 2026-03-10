import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { shiurim, categoryColors, categoryLabels, RABBI, type Shiur } from '../data/content';
import { useAppStore } from '../store/appStore';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { Alert } from 'react-native';

const categories = ['all', 'tanya', 'parasha', 'halacha', 'chassidut', 'general'] as const;
const labels: Record<string, string> = { all: 'הכל', ...categoryLabels };

function ShiurCard({ shiur }: { shiur: Shiur }) {
  const { isNotificationEnabled, toggleNotification } = useAppStore();
  const on = isNotificationEnabled(shiur.id);
  const color = categoryColors[shiur.category];

  const handleToggle = () => {
    toggleNotification(shiur.id);
    Alert.alert(on ? 'תזכורת בוטלה' : 'תזכורת הופעלה', `שיעור: ${shiur.title}`);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.catLabel, { color }]}>{categoryLabels[shiur.category]}</Text>
        <Pressable style={[styles.bellBtn, on && styles.bellOn]} onPress={handleToggle}>
          <Feather name={on ? 'bell' : 'bell-off'} size={18} color={on ? COLORS.skyDark : COLORS.textLight} />
          <Text style={[styles.bellText, on && { color: COLORS.skyDark }]}>{on ? 'פעיל' : 'תזכורת'}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{shiur.title}</Text>
      <Text style={styles.desc}>{shiur.description}</Text>
      <View style={styles.meta}>
        <Feather name="clock" size={13} color={COLORS.textLight} />
        <Text style={styles.metaText}>{shiur.day} · {shiur.time}</Text>
      </View>
      <View style={styles.meta}>
        <Feather name="map-pin" size={13} color={COLORS.textLight} />
        <Text style={styles.metaText}>{shiur.location}</Text>
      </View>
      <View style={styles.meta}>
        <Image source={RABBI.photo} style={styles.rabbiThumb} />
        <Text style={styles.metaText}>{shiur.teacher}</Text>
      </View>
    </View>
  );
}

export default function ShiurimScreen() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? shiurim : shiurim.filter((s) => s.category === filter);

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><Feather name="bell" size={28} color="#fff" /></View>
          <View>
            <Text style={styles.title}>לוח שיעורים</Text>
            <Text style={styles.sub}>הפעל תזכורות לשיעורים</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {categories.map((c) => (
          <Pressable key={c} style={[styles.chip, filter === c && (c === 'all' ? styles.chipActive : { backgroundColor: categoryColors[c], borderColor: categoryColors[c] })]} onPress={() => setFilter(c)}>
            <Text style={[styles.chipText, filter === c && c !== 'all' && { color: '#fff' }]}>{labels[c]}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.map((s) => <ShiurCard key={s.id} shiur={s} />)}

      <View style={styles.info}>
        <Text style={styles.infoEmoji}>📍</Text>
        <View>
          <Text style={styles.infoTitle}>בית חב"ד נתיבות</Text>
          <Text style={styles.infoSub}>לפרטים: הרב מנחם ידגר</Text>
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
  header: { position: 'relative', marginHorizontal: -16, marginTop: -16, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, marginBottom: 16 },
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: '#1a2a4a' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  filterBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.sky, borderColor: COLORS.sky },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textMid },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 12, fontWeight: '600', flex: 1 },
  bellBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.offWhite, borderWidth: 1.5, borderColor: COLORS.border },
  bellOn: { backgroundColor: 'rgba(75,191,207,0.1)', borderColor: COLORS.sky, color: COLORS.skyDark },
  bellText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  desc: { fontSize: 13, color: COLORS.textMid, lineHeight: 22, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  metaText: { fontSize: 12, color: COLORS.textLight },
  rabbiThumb: { width: 18, height: 18, borderRadius: 9 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  infoEmoji: { fontSize: 22 },
  infoTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  infoSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
});
