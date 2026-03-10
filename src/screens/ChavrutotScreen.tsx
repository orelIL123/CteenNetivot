import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { chavrutot, RABBI, type Chavruta } from '../data/content';
import { useAppStore } from '../store/appStore';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { Alert } from 'react-native';

const levelColors: Record<string, string> = { 'מתחיל': '#7EC8A4', 'בינוני': COLORS.sky, 'מתקדם': COLORS.sandDark };

function ChavrutaCard({ c }: { c: Chavruta }) {
  const { favoriteChavruta, toggleFavoriteChavruta } = useAppStore();
  const fav = favoriteChavruta.includes(c.id);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.avatar}><Text style={styles.avatarEmoji}>{c.avatar}</Text></View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{c.name}</Text>
            <Text style={styles.age}>גיל {c.age}</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: `${levelColors[c.level]}20` }]}>
            <Text style={[styles.levelText, { color: levelColors[c.level] }]}>{c.level}</Text>
          </View>
        </View>
        <Pressable style={[styles.favBtn, fav && styles.favOn]} onPress={() => toggleFavoriteChavruta(c.id)}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? '#E07B7B' : COLORS.textLight} />
        </Pressable>
      </View>
      <Text style={styles.bio}>{c.bio}</Text>
      <View style={styles.tags}>
        {c.subjects.map((s) => (
          <View key={s} style={styles.tag}><Feather name="book-open" size={11} color={COLORS.skyDark} /><Text style={styles.tagText}>{s}</Text></View>
        ))}
      </View>
      <View style={styles.avail}>
        <Text style={styles.availLabel}>זמינות:</Text>
        {c.availability.map((d) => <View key={d} style={styles.dayTag}><Text style={styles.dayText}>{d}</Text></View>)}
      </View>
      <Pressable style={styles.contactBtn} onPress={() => Alert.alert('בקשת חברותא', `נשלחה ל${c.name}!`)}>
        <Feather name="message-circle" size={16} color="#fff" />
        <Text style={styles.contactText}>שלח בקשת חברותא</Text>
      </Pressable>
    </View>
  );
}

export default function ChavrutotScreen() {
  const [filter, setFilter] = useState('all');
  const levels = ['all', 'מתחיל', 'בינוני', 'מתקדם'];
  const filtered = filter === 'all' ? chavrutot : chavrutot.filter((c) => c.level === filter);

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><Feather name="users" size={28} color="#fff" /></View>
          <View>
            <Text style={styles.title}>חברותות</Text>
            <Text style={styles.sub}>מצא חברותא ללימוד</Text>
          </View>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.introEmoji}>🤝</Text>
        <View>
          <Text style={styles.introTitle}>לימוד בחברותא</Text>
          <Text style={styles.introText}>"קנה לך חבר" — לימוד עם חברותא מעמיק את ההבנה ומוסיף שמחה ללימוד.</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {levels.map((l) => (
          <Pressable key={l} style={[styles.chip, filter === l && (l === 'all' ? styles.chipActive : { backgroundColor: levelColors[l], borderColor: levelColors[l] })]} onPress={() => setFilter(l)}>
            <Text style={[styles.chipText, filter === l && l !== 'all' && { color: '#fff' }]}>{l === 'all' ? 'כולם' : l}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.map((c) => <ChavrutaCard key={c.id} c={c} />)}

      <View style={styles.addBanner}>
        <View style={styles.addBannerLeft}>
          <Image source={RABBI.photo} style={styles.rabbiThumb} />
          <View>
            <Text style={styles.addTitle}>רוצה להצטרף לרשימה?</Text>
            <Text style={styles.addSub}>פנה ל{RABBI.name} להוספת פרטיך</Text>
          </View>
        </View>
        <Pressable style={styles.addBtn} onPress={() => Alert.alert('הצטרף', `צור קשר עם ${RABBI.name}`)}>
          <Text style={styles.addBtnText}>הצטרף</Text>
        </Pressable>
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
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: '#2a1a4a' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcon: { width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, color: '#fff', fontWeight: '700' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  intro: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: BORDER_RADIUS.md, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(155,126,200,0.15)' },
  introEmoji: { fontSize: 28 },
  introTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  introText: { fontSize: 13, color: COLORS.textMid, lineHeight: 22 },
  filterBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.sky, borderColor: COLORS.sky },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.textMid },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  avatar: { width: 48, height: 48, backgroundColor: COLORS.offWhite, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  age: { fontSize: 12, color: COLORS.textLight },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  levelText: { fontSize: 11, fontWeight: '600' },
  favBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.offWhite, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  favOn: { backgroundColor: 'rgba(224,123,123,0.1)', borderColor: 'rgba(224,123,123,0.3)' },
  bio: { fontSize: 13, color: COLORS.textMid, lineHeight: 22, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(75,191,207,0.08)', borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: 'rgba(75,191,207,0.2)' },
  tagText: { fontSize: 11, fontWeight: '500', color: COLORS.skyDark },
  avail: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 14 },
  availLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: '500' },
  dayTag: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: COLORS.offWhite, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  dayText: { fontSize: 11, fontWeight: '500', color: COLORS.textMid },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: '#9B7EC8', borderRadius: BORDER_RADIUS.sm },
  contactText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  addBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(232,169,106,0.2)' },
  addBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rabbiThumb: { width: 40, height: 40, borderRadius: 12 },
  addTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  addSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  addBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: COLORS.sand, borderRadius: BORDER_RADIUS.full },
  addBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
