import { View, Text, ScrollView, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { todayStudy, shiurim, RABBI } from '../data/content';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const today = hebrewDays[new Date().getDay()];
const todayShiurim = shiurim.filter((s) => s.day === today || s.day.includes(today));

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';

  return (
    <View style={styles.wrapper}>
      <TopHeader showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.greeting}>
            <Text style={styles.greetingSub}>{greeting} ✨</Text>
            <Text style={styles.title}>חב"ד לנוער נתיבות</Text>
            <Text style={styles.subtitle}>הרב מנחם ידגר</Text>
          </View>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{todayStudy.hebrewDate}</Text>
        </View>
      </View>

      {/* Rabbi message / image section */}
      <View style={styles.rabbiSection}>
        <View style={styles.rabbiCard}>
          <View style={styles.rabbiAvatar}>
            <Image source={RABBI.photo} style={styles.rabbiPhoto} resizeMode="cover" />
          </View>
          <View style={styles.rabbiContent}>
            <Text style={styles.rabbiLabel}>הודעה מהרב</Text>
            <Text style={styles.rabbiMessage}>
              "ברוכים הבאים! שמחים לראותכם. מקווים לראות אתכם בשיעורים ובפעילויות — בית חב"ד פתוח לכולם. בהצלחה בלימוד!"
            </Text>
            <Text style={styles.rabbiName}>— {RABBI.name}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => nav.navigate('Daily')}>
          <View style={styles.actionIcon}><Feather name="book-open" size={26} color="#fff" /></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>לימוד יומי</Text>
            <Text style={styles.actionSub}>חיתת ורמב"ם</Text>
          </View>
          <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>

        <Pressable style={[styles.actionBtn, styles.actionSky]} onPress={() => nav.navigate('Updates')}>
          <View style={styles.actionIcon}><Feather name="rss" size={26} color="#fff" /></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>עדכונים</Text>
            <Text style={styles.actionSub}>שיעורים והתראות</Text>
          </View>
          <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>

        <Pressable style={[styles.actionBtn, styles.actionGreen]} onPress={() => nav.navigate('Chavrutot')}>
          <View style={styles.actionIcon}><Feather name="users" size={26} color="#fff" /></View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>חברותות</Text>
            <Text style={styles.actionSub}>מצא חברותא</Text>
          </View>
          <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
      </View>

      {/* Hayom Yom */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="star" size={16} color={COLORS.sandDark} />
          <Text style={styles.sectionTitle}>היום יום</Text>
        </View>
        <View style={styles.hayomCard}>
          <Text style={styles.hayomDate}>{todayStudy.hebrewDate}</Text>
          <Text style={styles.hayomText}>{todayStudy.hayomYom.text}</Text>
        </View>
      </View>

      {/* Today Shiurim */}
      {todayShiurim.length > 0 ? (
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <Text style={styles.sectionTitle}>שיעורים היום</Text>
            <Pressable onPress={() => nav.navigate('Updates')}>
              <Text style={styles.sectionLink}>כל השיעורים ←</Text>
            </Pressable>
          </View>
          {todayShiurim.map((s) => (
            <View key={s.id} style={styles.shiurCard}>
              <Text style={styles.shiurTime}>{s.time}</Text>
              <View>
                <Text style={styles.shiurTitle}>{s.title}</Text>
                <Text style={styles.shiurLoc}>{s.location}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noShiur}>
          <Text style={styles.noShiurEmoji}>📚</Text>
          <Text style={styles.noShiurText}>אין שיעורים מתוכננים היום</Text>
          <Pressable onPress={() => nav.navigate('Updates')}>
            <Text style={styles.noShiurLink}>ראה את כל לוח השיעורים</Text>
          </Pressable>
        </View>
      )}

      {/* קח חלק בעשייה */}
      <Pressable style={styles.takePartBtn} onPress={() => Alert.alert('קח חלק בעשייה', 'בהמשך נתחבר לאפשרות תרומה לרב מנחם ידגר ולבית חב"ד לנוער נתיבות.')}>
        <Feather name="heart" size={22} color="#fff" />
        <Text style={styles.takePartText}>קח חלק בעשייה</Text>
        <Text style={styles.takePartSub}>תרומה לרב מנחם ידגר · בהמשך נתחבר</Text>
      </Pressable>

      <View style={{ height: 100 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { paddingBottom: 20 },
  header: { position: 'relative', paddingBottom: 28, overflow: 'hidden' },
  headerGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.charcoal,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, gap: 16 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#fff' },
  greeting: { flex: 1 },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: COLORS.sky, fontWeight: '500', marginTop: 2 },
  dateBadge: {
    marginHorizontal: 20, marginTop: 16, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  dateText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  rabbiSection: { paddingHorizontal: 16, marginTop: 20 },
  rabbiCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md,
    padding: 18, gap: 14, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 4, borderWidth: 1, borderColor: 'rgba(232,169,106,0.2)',
  },
  rabbiAvatar: {
    width: 56, height: 56, borderRadius: 16, overflow: 'hidden',
    backgroundColor: 'rgba(232,169,106,0.15)',
  },
  rabbiPhoto: { width: '100%', height: '100%' },
  rabbiContent: { flex: 1 },
  rabbiLabel: { fontSize: 11, fontWeight: '600', color: COLORS.sandDark, letterSpacing: 0.5, marginBottom: 6 },
  rabbiMessage: { fontSize: 15, lineHeight: 24, color: COLORS.textDark, fontStyle: 'italic' },
  rabbiName: { fontSize: 12, color: COLORS.textLight, marginTop: 8, fontWeight: '500' },

  actions: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: BORDER_RADIUS.md, gap: 14 },
  actionPrimary: { backgroundColor: COLORS.sand },
  actionSky: { backgroundColor: COLORS.sky },
  actionGreen: { backgroundColor: '#7EC8A4' },
  actionIcon: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  sectionLink: { fontSize: 13, fontWeight: '600', color: COLORS.skyDark },
  hayomCard: {
    backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  hayomDate: { fontSize: 12, fontWeight: '600', color: COLORS.sandDark, marginBottom: 10 },
  hayomText: { fontSize: 15, lineHeight: 26, color: COLORS.textMid },
  shiurCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', padding: 14, marginTop: 8,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  shiurTime: { fontSize: 18, fontWeight: '800', color: COLORS.skyDark, minWidth: 52 },
  shiurTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  shiurLoc: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  noShiur: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 24, padding: 28, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  noShiurEmoji: { fontSize: 32, marginBottom: 8 },
  noShiurText: { fontSize: 15, color: COLORS.textMid },
  noShiurLink: { marginTop: 8, fontSize: 14, fontWeight: '600', color: COLORS.skyDark },
  takePartBtn: {
    marginHorizontal: 16, marginTop: 24, padding: 20, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.sand, flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  takePartText: { fontSize: 17, fontWeight: '700', color: '#fff', flex: 1 },
  takePartSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
});
