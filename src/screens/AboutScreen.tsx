import { View, Text, ScrollView, Pressable, Image, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import { RABBI } from '../data/content';
import TopHeader from '../components/TopHeader';

const WHATSAPP_URL = `https://wa.me/${RABBI.whatsapp}`;

// ─── Info item ────────────────────────────────────────────────────────────────
function InfoItem({ icon, label, value, onPress, iconColor = COLORS.skyDark }: {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  iconColor?: string;
}) {
  return (
    <Pressable style={info.item} onPress={onPress}>
      <View style={[info.iconWrap, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={info.text}>
        <Text style={info.label}>{label}</Text>
        <Text style={info.value}>{value}</Text>
      </View>
      {onPress && (
        <View style={[info.chevron, { backgroundColor: `${iconColor}18` }]}>
          <Ionicons name="chevron-back" size={14} color={iconColor} />
        </View>
      )}
    </Pressable>
  );
}

// ─── Activity card ────────────────────────────────────────────────────────────
function ActivityCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={act.card}>
      <Text style={act.emoji}>{emoji}</Text>
      <Text style={act.title}>{title}</Text>
      <Text style={act.desc}>{desc}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AboutScreen() {
  const handleCall = () => Linking.openURL(`tel:${RABBI.phone}`);
  const handleWhatsApp = () => Linking.openURL(WHATSAPP_URL);
  const handleInstagram = () => Linking.openURL('https://www.instagram.com/cteen_netivot');
  const handleWaze = () => Linking.openURL('https://waze.com/ul?q=בית+חב"ד+נתיבות');

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hero header ── */}
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.orgTitle}>חב"ד לנוער נתיבות</Text>
          <Text style={styles.orgSub}>CTeen Netivot · מרכז נוער חסידי בנתיבות</Text>
          <View style={styles.headerBadges}>
            <View style={styles.badge}><Text style={styles.badgeText}>🕯️ שבת ומועדים</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>📖 שיעורים שבועיים</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>❤️ התנדבות</Text></View>
          </View>
        </View>

        {/* ── Rabbi card ── */}
        <View style={styles.rabbiCard}>
          <View style={styles.rabbiAvatar}>
            <Image source={RABBI.photo} style={styles.rabbiPhoto} resizeMode="cover" />
          </View>
          <View style={styles.rabbiInfo}>
            <Text style={styles.rabbiRole}>{RABBI.role}</Text>
            <Text style={styles.rabbiName}>{RABBI.name}</Text>
            <Text style={styles.rabbiCity}>נתיבות, ישראל</Text>
          </View>
          <View style={styles.rabbiActions}>
            <Pressable style={styles.callBtn} onPress={handleCall}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.callText}>טלפון</Text>
            </Pressable>
            <Pressable style={styles.whatsappBtn} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.callText}>וואטסאפ</Text>
            </Pressable>
          </View>
        </View>

        {/* ── About section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={16} color={COLORS.sandDark} />
            <Text style={styles.sectionTitle}>אודות בית חב"ד לנוער</Text>
          </View>
          <Text style={styles.bodyText}>
            בית חב"ד לנוער בנתיבות הוא מקום חם ומקבל לכל נער ונערה. אנו מציעים שיעורים, פעילויות, חגים ועוד — הכל בסביבה שמחה ואוהבת.
          </Text>
          <Text style={styles.bodyText}>
            הרב מנחם ידגר עומד בראש הבית ומוביל את הנוער בדרך התורה והחסידות, תוך שמירה על גישה פתוחה ומקבלת לכל אחד ואחת.
          </Text>
          <Text style={styles.bodyText}>
            CTeen הוא רשת בינלאומית של מרכזי נוער חב"ד הפועלים בעשרות מדינות. הסניף בנתיבות מאחד נוער מרחבי העיר תחת קורת גג אחת — לימוד, צמיחה ושמחה.
          </Text>
        </View>

        {/* ── Contact & info ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={16} color={COLORS.sandDark} />
            <Text style={styles.sectionTitle}>פרטי קשר ומיקום</Text>
          </View>
          <InfoItem
            icon="location"
            label="כתובת"
            value='בית חב"ד, נתיבות'
            onPress={handleWaze}
            iconColor={COLORS.red}
          />
          <InfoItem
            icon="time"
            label="שעות פעילות"
            value="ראשון–שישי · 08:00–22:00"
            iconColor={COLORS.sandDark}
          />
          <InfoItem
            icon="call"
            label="טלפון"
            value="054-536-7770"
            onPress={handleCall}
            iconColor={COLORS.sky}
          />
          <InfoItem
            icon="logo-whatsapp"
            label="וואטסאפ"
            value="שלח הודעה לרב"
            onPress={handleWhatsApp}
            iconColor="#25D366"
          />
          <InfoItem
            icon="logo-instagram"
            label="אינסטגרם"
            value="@cteen_netivot"
            onPress={handleInstagram}
            iconColor="#E040FB"
          />
        </View>

        {/* ── Activities ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={16} color={COLORS.sandDark} />
            <Text style={styles.sectionTitle}>מה עושים אצלנו?</Text>
          </View>
          <View style={act.grid}>
            <ActivityCard emoji="📖" title="שיעורים שבועיים" desc="תניא, פרשה, הלכה וחסידות לכל הרמות" />
            <ActivityCard emoji="🤝" title="חברותא" desc="לימוד בצמד — מצא חברותא קבועה" />
            <ActivityCard emoji="🎉" title="חגים ואירועים" desc="ימי הולדת, חנוכה, פורים ועוד" />
            <ActivityCard emoji="🏕️" title="קייטנות" desc="קייטנות קיץ וחורף לנוער" />
            <ActivityCard emoji="❤️" title="התנדבות" desc="מעשים טובים ועזרה לזולת" />
            <ActivityCard emoji="🎵" title="ניגונים ושירה" desc={'שבת חסידית עם ניגוני חב"ד'} />
          </View>
        </View>

        {/* ── Schedule ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={16} color={COLORS.sandDark} />
            <Text style={styles.sectionTitle}>לוח פעילות קבוע</Text>
          </View>
          {[
            { day: 'ראשון', activity: 'שיעור תניא שבועי', time: '20:00', icon: 'book', color: COLORS.sandDark },
            { day: 'שני–חמישי', activity: 'הלכה יומית לפני שחרית', time: '07:30', icon: 'sunny', color: COLORS.sky },
            { day: 'שלישי', activity: 'לימוד גמרא', time: '19:30', icon: 'school', color: COLORS.blue },
            { day: 'שישי', activity: 'פרשת השבוע', time: '18:30', icon: 'star', color: COLORS.green },
            { day: 'שבת', activity: 'שיעור חסידות לנוער', time: '17:00', icon: 'heart', color: COLORS.red },
          ].map((item) => (
            <View key={item.day} style={sched.row}>
              <View style={[sched.iconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={sched.info}>
                <Text style={sched.activity}>{item.activity}</Text>
                <Text style={sched.day}>{item.day}</Text>
              </View>
              <View style={sched.timeBadge}>
                <Text style={sched.time}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Values ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="diamond" size={16} color={COLORS.sandDark} />
            <Text style={styles.sectionTitle}>הערכים שלנו</Text>
          </View>
          <View style={styles.valuesGrid}>
            {[
              { emoji: '📖', label: 'לימוד תורה' },
              { emoji: '🤝', label: 'אחדות' },
              { emoji: '❤️', label: 'אהבת ישראל' },
              { emoji: '✨', label: 'שמחה' },
              { emoji: '🕯️', label: 'שבת ומועד' },
              { emoji: '🌟', label: 'חסידות' },
              { emoji: '🙏', label: 'כבוד הזולת' },
              { emoji: '🌱', label: 'צמיחה אישית' },
              { emoji: '💪', label: 'עצמאות' },
            ].map((v) => (
              <View key={v.label} style={styles.valueItem}>
                <Text style={styles.valueEmoji}>{v.emoji}</Text>
                <Text style={styles.valueLabel}>{v.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>רוצה להצטרף? 🎉</Text>
          <Text style={styles.ctaText}>כולם מוזמנים — ללא קשר לרמה ורקע. בוא כמו שאתה!</Text>
          <View style={styles.ctaBtns}>
            <Pressable style={[styles.ctaBtn, styles.ctaBtnCall]} onPress={handleCall}>
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>התקשר עכשיו</Text>
            </Pressable>
            <Pressable style={[styles.ctaBtn, styles.ctaBtnWA]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>וואטסאפ</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="heart" size={14} color={COLORS.red} />
          <Text style={styles.footerText}>נבנה באהבה עבור נוער נתיבות</Text>
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
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 28,
    position: 'relative',
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.charcoal },
  logo: { width: 80, height: 80, borderRadius: 22, backgroundColor: '#fff', marginBottom: 12 },
  orgTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  orgSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4, textAlign: 'center' },
  headerBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  // Rabbi card
  rabbiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,169,106,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rabbiAvatar: { width: 54, height: 54, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(232,169,106,0.15)' },
  rabbiPhoto: { width: '100%', height: '100%' },
  rabbiInfo: { flex: 1 },
  rabbiRole: { fontSize: 11, fontWeight: '600', color: COLORS.sandDark, letterSpacing: 0.5, marginBottom: 2 },
  rabbiName: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  rabbiCity: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  rabbiActions: { flexDirection: 'column', gap: 6 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.sand, borderRadius: BORDER_RADIUS.full },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#25D366', borderRadius: BORDER_RADIUS.full },
  callText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  // Sections
  section: { backgroundColor: '#fff', padding: 18, borderRadius: BORDER_RADIUS.md, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  bodyText: { fontSize: 14, color: COLORS.textMid, lineHeight: 24, marginBottom: 10 },
  // Values grid
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valueItem: { width: '30%', alignItems: 'center', padding: 12, backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm },
  valueEmoji: { fontSize: 22, marginBottom: 6 },
  valueLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMid, textAlign: 'center' },
  // CTA
  ctaCard: { backgroundColor: COLORS.charcoal, padding: 20, borderRadius: BORDER_RADIUS.lg, marginBottom: 20, alignItems: 'center', gap: 8 },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  ctaText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20 },
  ctaBtns: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
  ctaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: BORDER_RADIUS.md },
  ctaBtnCall: { backgroundColor: COLORS.sand },
  ctaBtnWA: { backgroundColor: '#25D366' },
  ctaBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 },
  footerText: { fontSize: 13, color: COLORS.textLight },
});

const info = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: COLORS.textLight, marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '500', color: COLORS.textDark },
  chevron: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

const act = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47.5%',
    backgroundColor: COLORS.offWhite,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emoji: { fontSize: 24, marginBottom: 8 },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  desc: { fontSize: 11, color: COLORS.textLight, lineHeight: 16 },
});

const sched = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  activity: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  day: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  timeBadge: { backgroundColor: COLORS.offWhite, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  time: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
});
