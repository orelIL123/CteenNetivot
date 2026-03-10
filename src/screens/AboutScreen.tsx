import { View, Text, ScrollView, Pressable, Image, StyleSheet, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import { RABBI } from '../data/content';
import TopHeader from '../components/TopHeader';

const WHATSAPP_URL = `https://wa.me/${RABBI.whatsapp}`;

export default function AboutScreen() {
  const handleCall = () => Linking.openURL(`tel:${RABBI.phone}`);
  const handleWhatsApp = () => Linking.openURL(WHATSAPP_URL);

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.orgTitle}>חב"ד לנוער נתיבות</Text>
        <Text style={styles.orgSub}>CTeen Netivot — נתיבות</Text>
      </View>

      <View style={styles.rabbiCard}>
        <View style={styles.rabbiAvatar}>
          <Image source={RABBI.photo} style={styles.rabbiPhoto} resizeMode="cover" />
        </View>
        <View style={styles.rabbiInfo}>
          <Text style={styles.rabbiRole}>{RABBI.role}</Text>
          <Text style={styles.rabbiName}>{RABBI.name}</Text>
          <Text style={styles.rabbiCity}>נתיבות</Text>
        </View>
        <View style={styles.rabbiActions}>
          <Pressable style={styles.callBtn} onPress={handleCall}>
            <Feather name="phone" size={16} color="#fff" />
            <Text style={styles.callText}>טלפון</Text>
          </Pressable>
          <Pressable style={styles.whatsappBtn} onPress={handleWhatsApp}>
            <Feather name="message-circle" size={16} color="#fff" />
            <Text style={styles.callText}>וואטסאפ</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="star" size={16} color={COLORS.sandDark} />
          <Text style={styles.sectionTitle}>אודות בית חב"ד לנוער</Text>
        </View>
        <Text style={styles.bodyText}>
          בית חב"ד לנוער בנתיבות הוא מקום חם ומקבל לכל נער ונערה. אנו מציעים שיעורים, פעילויות, חגים ועוד — הכל בסביבה שמחה ואוהבת.
        </Text>
        <Text style={styles.bodyText}>
          הרב מנחם ידגר עומד בראש הבית ומוביל את הנוער בדרך התורה והחסידות, תוך שמירה על גישה פתוחה ומקבלת לכל אחד ואחת.
        </Text>
      </View>

      <View style={styles.infoList}>
        {[
          { icon: 'map-pin', title: 'כתובת', value: 'בית חב"ד, נתיבות' },
          { icon: 'clock', title: 'שעות פעילות', value: 'ראשון–שישי · 08:00–22:00' },
          { icon: 'phone', title: 'טלפון', value: '054-5367770', onPress: handleCall },
        ].map((item) => (
          <Pressable key={item.title} style={styles.infoItem} onPress={item.onPress}>
            <View style={styles.infoIcon}><Feather name={item.icon as any} size={20} color={COLORS.skyDark} /></View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{item.title}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
            {item.icon === 'phone' && (
              <Pressable style={styles.phoneBtn} onPress={handleCall}>
                <Feather name="phone" size={14} color="#fff" />
              </Pressable>
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.values}>
        <Text style={styles.valuesTitle}>הערכים שלנו</Text>
        <View style={styles.valuesGrid}>
          {[
            { emoji: '📖', label: 'לימוד תורה' },
            { emoji: '🤝', label: 'אחדות' },
            { emoji: '❤️', label: 'אהבת ישראל' },
            { emoji: '✨', label: 'שמחה' },
            { emoji: '🕯️', label: 'שבת ומועד' },
            { emoji: '🌟', label: 'חסידות' },
          ].map((v) => (
            <View key={v.label} style={styles.valueItem}>
              <Text style={styles.valueEmoji}>{v.emoji}</Text>
              <Text style={styles.valueLabel}>{v.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Feather name="heart" size={14} color="#E07B7B" />
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
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 32, position: 'relative' },
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: COLORS.charcoal },
  logo: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#fff', marginBottom: 12 },
  orgTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  orgSub: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  rabbiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: BORDER_RADIUS.md, marginBottom: 16, gap: 14, borderWidth: 1, borderColor: 'rgba(232,169,106,0.2)' },
  rabbiAvatar: { width: 56, height: 56, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(232,169,106,0.15)' },
  rabbiPhoto: { width: '100%', height: '100%' },
  rabbiInfo: { flex: 1 },
  rabbiRole: { fontSize: 11, fontWeight: '600', color: COLORS.sandDark, letterSpacing: 0.5, marginBottom: 2 },
  rabbiName: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  rabbiCity: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  rabbiActions: { flexDirection: 'row', gap: 10 },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: COLORS.sand, borderRadius: BORDER_RADIUS.full },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#25D366', borderRadius: BORDER_RADIUS.full },
  callText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  section: { backgroundColor: '#fff', padding: 18, borderRadius: BORDER_RADIUS.md, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  bodyText: { fontSize: 14, color: COLORS.textMid, lineHeight: 24, marginBottom: 10 },
  infoList: { marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, marginBottom: 10, borderRadius: BORDER_RADIUS.md, gap: 14, borderWidth: 1, borderColor: COLORS.border },
  infoIcon: { width: 40, height: 40, backgroundColor: 'rgba(75,191,207,0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textLight, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500', color: COLORS.textDark },
  phoneBtn: { width: 36, height: 36, backgroundColor: COLORS.sky, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  values: { backgroundColor: '#fff', padding: 18, borderRadius: BORDER_RADIUS.md, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  valuesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 14 },
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valueItem: { width: '30%', alignItems: 'center', padding: 12, backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm },
  valueEmoji: { fontSize: 22, marginBottom: 6 },
  valueLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMid },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  footerText: { fontSize: 13, color: COLORS.textLight },
});
