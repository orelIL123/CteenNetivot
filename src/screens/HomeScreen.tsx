import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, StyleSheet,
  Alert, Linking, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { todayStudy, RABBI } from '../data/content';
import { useAppStore } from '../store/appStore';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../constants/theme';
import TopHeader from '../components/TopHeader';
import { getShiurim, getAppConfig, type ShiurDoc, type AppConfigDoc } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

// ── Vibrant palette ────────────────────────────────────────────────────────────
const ORANGE      = '#FF6B2B';
const ORANGE_DEEP = '#E8531A';
const ORANGE_SOFT = '#FFF0EA';
const ORANGE_MID  = 'rgba(255,107,43,0.14)';
const BLUE        = '#29B6E8';
const BLUE_DEEP   = '#0A9DC9';
const BLUE_SOFT   = '#E8F8FD';
const BLUE_MID    = 'rgba(41,182,232,0.14)';
const WHITE       = '#FFFFFF';
const OFF_WHITE   = '#F7FAFC';
const DARK        = '#1A2438';
const TEXT_SOFT   = '#5A6880';
const TEXT_LIGHT  = '#94A3B8';

const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const todayHebrew = hebrewDays[new Date().getDay()];

function HeroVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

// ── Action card ────────────────────────────────────────────────────────────────
const GOLD_C  = '#D4A54A';
const GREEN_C = '#2DA96B';
const RED_C   = '#D9453B';
const BLUE_C  = '#2A6FDB';

type ActionCardColor = 'orange' | 'blue' | 'orange2' | 'blue2';

const ACTION_COLORS: Record<ActionCardColor, { bg: string; shadow: string; glow: string }> = {
  orange:  { bg: GOLD_C,  shadow: GOLD_C,  glow: 'rgba(212,165,74,0.38)' },
  blue:    { bg: BLUE_C,  shadow: BLUE_C,  glow: 'rgba(42,111,219,0.38)' },
  orange2: { bg: GREEN_C, shadow: GREEN_C, glow: 'rgba(45,169,107,0.38)' },
  blue2:   { bg: RED_C,   shadow: RED_C,   glow: 'rgba(217,69,59,0.38)'  },
};

function ActionCard({
  color,
  icon,
  title,
  sub,
  onPress,
  width,
}: {
  color: ActionCardColor;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  sub: string;
  onPress: () => void;
  width: number;
}) {
  const c = ACTION_COLORS[color];
  return (
    <Pressable
      style={({ pressed }) => [
        ac.card,
        {
          width,
          backgroundColor: c.bg,
          opacity: pressed ? 0.88 : 1,
          shadowColor: c.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.42,
          shadowRadius: 18,
          elevation: 10,
        },
      ]}
      onPress={onPress}
    >
      {/* Top-right decorative ring */}
      <View style={ac.ringTopRight} />
      {/* Bottom-left decorative dot */}
      <View style={ac.dotBottomLeft} />
      <View style={ac.iconWrap}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={ac.title}>{title}</Text>
      <Text style={ac.sub}>{sub}</Text>
      {/* Arrow chip */}
      <View style={ac.arrowChip}>
        <Ionicons name="arrow-back" size={10} color="#fff" />
      </View>
    </Pressable>
  );
}

const ac = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    minHeight: 128,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  ringTopRight: {
    position: 'absolute',
    top: -28,
    right: -28,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 18,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dotBottomLeft: {
    position: 'absolute',
    bottom: -16,
    left: -16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.1 },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 3, lineHeight: 16 },
  arrowChip: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHeading({ title, accent = 'orange' }: { title: string; accent?: 'orange' | 'blue' }) {
  return (
    <View style={sh.row}>
      <View style={[sh.bar, { backgroundColor: accent === 'orange' ? ORANGE : BLUE }]} />
      <Text style={sh.text}>{title}</Text>
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: SPACING.md,
  },
  bar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    letterSpacing: 0.1,
  },
});

// ── Main screen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { profile } = useAuth();
  const { userName } = useAppStore();
  const displayName = profile?.firstName ?? userName ?? 'אורח';

  const [todayShiurim, setTodayShiurim] = useState<ShiurDoc[]>([]);
  const [heroConfig, setHeroConfig] = useState<AppConfigDoc | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  const heroWidth = width - SPACING.md * 2;
  const heroHeight = heroWidth * (9 / 16);
  const gap = SPACING.sm;
  const actionCardWidth = (width - SPACING.md * 2 - gap) / 2;
  const heroMediaType = heroConfig?.heroMediaType ?? (heroConfig?.heroVideoUrl ? 'video' : 'image');
  const heroMediaUri = heroMediaType === 'video' ? heroConfig?.heroVideoUrl : heroConfig?.heroImageUrl;

  const loadData = useCallback(async () => {
    const [all, config] = await Promise.all([getShiurim(), getAppConfig()]);
    const filtered = all.filter((s) =>
      s.active && (s.day === todayHebrew || s.day === 'יומי' || s.day.includes(todayHebrew))
    );
    setTodayShiurim(filtered);
    setHeroConfig(config);
    setHeroLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <View style={styles.wrapper}>
      <TopHeader showBack={false} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ══════════════════════════════════════════════════
            HERO BANNER — bold orange gradient with depth
            ══════════════════════════════════════════════ */}
        <View style={styles.heroBanner}>
          {/* Background orbs */}
          <View style={styles.orbOrangeTR} />
          <View style={styles.orbBlueBL} />
          <View style={styles.orbWhiteCenter} />

          {/* Top row: logo + greeting */}
          <View style={styles.heroBannerRow}>
            <View style={styles.logoRing}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.greetingBox}>
              <Text style={styles.greetingHello}>שלום, {displayName} 👋</Text>
              <Text style={styles.greetingSub}>ברוכים הבאים לחב"ד לנוער נתיבות</Text>
            </View>
          </View>

          {/* Date row */}
          <View style={styles.heroDateRow}>
            <View style={styles.datePill}>
              <Ionicons name="sunny" size={11} color={WHITE} />
              <Text style={styles.datePillText}>{todayStudy.hebrewDate}</Text>
            </View>
            <View style={styles.dayPill}>
              <Text style={styles.dayPillText}>יום {todayHebrew}</Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            HERO MEDIA — floating card lifted over banner
            ══════════════════════════════════════════════ */}
        <View style={styles.heroMediaSection}>
          {heroLoading ? (
            <View style={[styles.heroBox, { height: heroHeight }]}>
              <ActivityIndicator color={ORANGE} size="large" />
            </View>
          ) : heroMediaUri && heroConfig ? (
            <View style={[styles.heroBox, { height: heroHeight }]}>
              {heroMediaType === 'video' ? (
                <HeroVideo uri={heroMediaUri} />
              ) : (
                <Image source={{ uri: heroMediaUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              )}
              {/* Gradient scrim */}
              <View style={styles.heroScrim} />
              {/* Badge */}
              {heroMediaType === 'video' && (
                <View style={styles.heroLiveBadge}>
                  <View style={styles.heroLiveDot} />
                  <Text style={styles.heroLiveBadgeText}>LIVE</Text>
                </View>
              )}
              {/* Orange bottom bar decoration */}
              <View style={styles.heroOrangeBar} />
              {/* Title overlay */}
              {heroConfig.heroTitle ? (
                <View style={styles.heroTextWrap}>
                  {heroConfig.heroSubtitle ? (
                    <View style={styles.heroSubBadge}>
                      <Text style={styles.heroSubBadgeText}>{heroConfig.heroSubtitle}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.heroTitle}>{heroConfig.heroTitle}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={[styles.heroBox, styles.heroFallback, { height: heroHeight }]}>
              {/* Decorative blue orb */}
              <View style={styles.heroFallbackOrb} />
              <View style={styles.heroFallbackLogoWrap}>
                <Image source={require('../../assets/logo.png')} style={styles.heroFallbackLogo} resizeMode="contain" />
              </View>
              <Text style={styles.heroFallbackTitle}>חב"ד לנוער נתיבות</Text>
              <Text style={styles.heroFallbackSub}>CTeen Netivot</Text>
            </View>
          )}
        </View>

        {/* ══════════════════════════════════════════════════
            RABBI CARD — white with orange accent
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.rabbiCard}>
            {/* Orange left accent strip */}
            <View style={styles.rabbiAccent} />

            <View style={styles.rabbiAvatarWrap}>
              <Image source={RABBI.photo} style={styles.rabbiPhoto} resizeMode="cover" />
              <View style={styles.rabbiOnlineDot} />
            </View>

            <View style={styles.rabbiInfo}>
              <Text style={styles.rabbiName}>הרב מנחם ידגר</Text>
              <Text style={styles.rabbiRole}>{RABBI.role}</Text>
              <View style={styles.rabbiTagRow}>
                <View style={styles.rabbiTag}>
                  <Ionicons name="location" size={10} color={ORANGE} />
                  <Text style={styles.rabbiTagText}>נתיבות</Text>
                </View>
                <View style={[styles.rabbiTag, { backgroundColor: BLUE_MID }]}>
                  <Ionicons name="star" size={10} color={BLUE_DEEP} />
                  <Text style={[styles.rabbiTagText, { color: BLUE_DEEP }]}>חב"ד</Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.waBtn, pressed && { opacity: 0.85 }]}
              onPress={() => Linking.openURL(`https://wa.me/${RABBI.whatsapp}`)}
            >
              <Ionicons name="logo-whatsapp" size={15} color="#fff" />
              <Text style={styles.waBtnText}>וואטסאפ</Text>
            </Pressable>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            QUICK ACTIONS GRID
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <SectionHeading title="פעולות מהירות" accent="orange" />
          <View style={[styles.actionsGrid, { gap }]}>
            <ActionCard
              color="orange"
              icon="book-outline"
              title="לימוד יומי"
              sub='חיתת ורמב"ם'
              onPress={() => nav.navigate('Daily')}
              width={actionCardWidth}
            />
            <ActionCard
              color="blue"
              icon="images-outline"
              title="עדכונים"
              sub="תמונות מפעילויות"
              onPress={() => nav.navigate('Updates')}
              width={actionCardWidth}
            />
            <ActionCard
              color="orange2"
              icon="book"
              title="שיעורים"
              sub="הרשם לשיעורים"
              onPress={() => nav.navigate('Shiurim')}
              width={actionCardWidth}
            />
            <ActionCard
              color="blue2"
              icon="heart-outline"
              title="התנדבות"
              sub="עזרה לקהילה"
              onPress={() => nav.navigate('Volunteer')}
              width={actionCardWidth}
            />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            HAYOM YOM CARD — blue accent
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <SectionHeading title="היום יום" accent="blue" />
          <View style={styles.hayomCard}>
            {/* Blue top bar */}
            <View style={styles.hayomTopBand} />
            <View style={styles.hayomInner}>
              <View style={styles.hayomTopRow}>
                <View style={styles.hayomDateBadge}>
                  <Ionicons name="calendar" size={11} color={WHITE} />
                  <Text style={styles.hayomDate}>{todayStudy.hebrewDate}</Text>
                </View>
                <View style={styles.hayomIconWrap}>
                  <Feather name="book-open" size={14} color={BLUE} />
                </View>
              </View>
              {/* Separator */}
              <View style={styles.hayomSeparator} />
              <Text style={styles.hayomText}>{todayStudy.hayomYom.text}</Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            TODAY'S SHIURIM
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          {todayShiurim.length > 0 ? (
            <>
              <View style={styles.sectionHeadRow}>
                <SectionHeading title="שיעורים היום" accent="orange" />
                <Pressable
                  style={styles.seeAllBtn}
                  onPress={() => nav.navigate('Shiurim')}
                >
                  <Text style={styles.seeAllText}>הכל</Text>
                  <Ionicons name="chevron-back" size={12} color={WHITE} />
                </Pressable>
              </View>

              {todayShiurim.map((s) => (
                <Pressable
                  key={s.id}
                  style={({ pressed }) => [styles.shiurRow, pressed && { opacity: 0.88 }]}
                  onPress={() => nav.navigate('Shiurim')}
                >
                  {/* Orange time badge */}
                  <View style={styles.shiurTimeBadge}>
                    <Feather name="clock" size={10} color={WHITE} />
                    <Text style={styles.shiurTime}>{s.time}</Text>
                  </View>
                  <View style={styles.shiurInfo}>
                    <Text style={styles.shiurTitle} numberOfLines={1}>{s.title}</Text>
                    <View style={styles.shiurLocRow}>
                      <Feather name="map-pin" size={10} color={TEXT_LIGHT} />
                      <Text style={styles.shiurLoc}>{s.location}</Text>
                    </View>
                  </View>
                  {/* Blue attendance chip */}
                  <View style={styles.shiurAttend}>
                    <Ionicons name="people" size={12} color={BLUE_DEEP} />
                    <Text style={styles.shiurAttendCount}>{s.rsvpUids.length}</Text>
                  </View>
                  {/* Colored left border */}
                  <View style={styles.shiurLeftBorder} />
                </Pressable>
              ))}
            </>
          ) : (
            <>
              <SectionHeading title="שיעורים היום" accent="orange" />
              <View style={styles.noShiurCard}>
                <View style={styles.noShiurIconWrap}>
                  <Text style={styles.noShiurEmoji}>📚</Text>
                </View>
                <Text style={styles.noShiurText}>אין שיעורים מתוכננים היום</Text>
                <Pressable
                  style={styles.noShiurBtn}
                  onPress={() => nav.navigate('Shiurim')}
                >
                  <Text style={styles.noShiurBtnText}>ראה את כל השיעורים</Text>
                  <Ionicons name="chevron-back" size={12} color={WHITE} />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {/* ══════════════════════════════════════════════════
            CTA CARD — bold orange gradient
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.ctaCard, pressed && { opacity: 0.9 }]}
            onPress={() =>
              Alert.alert(
                'קח חלק בעשייה',
                'בהמשך נתחבר לאפשרות תרומה לרב מנחם ידגר ולבית חב"ד לנוער נתיבות.'
              )
            }
          >
            {/* Background rings */}
            <View style={styles.ctaRing1} />
            <View style={styles.ctaRing2} />

            <View style={styles.ctaLeft}>
              <View style={styles.ctaIconWrap}>
                <Ionicons name="heart" size={22} color={ORANGE} />
              </View>
              <View>
                <Text style={styles.ctaTitle}>קח חלק בעשייה</Text>
                <Text style={styles.ctaSub}>תרומה לבית חב"ד · בהמשך נתחבר</Text>
              </View>
            </View>

            <View style={styles.ctaArrow}>
              <Ionicons name="arrow-back" size={14} color={WHITE} />
            </View>
          </Pressable>
        </View>

        {/* ══════════════════════════════════════════════════
            PROMO BANNER — blue
            ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Pressable
            style={({ pressed }) => [styles.promoBanner, pressed && { opacity: 0.9 }]}
            onPress={() => nav.navigate('Chavrutot')}
          >
            <View style={styles.promoOrb} />
            <View style={styles.promoLeft}>
              <View style={styles.promoIconBox}>
                <Ionicons name="people" size={20} color={WHITE} />
              </View>
              <View>
                <Text style={styles.promoTitle}>מצא חברותא</Text>
                <Text style={styles.promoSub}>למד עם חבר · חבדניקים נתיבות</Text>
              </View>
            </View>
            <View style={styles.promoArrow}>
              <Ionicons name="arrow-back" size={14} color={BLUE} />
            </View>
          </Pressable>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: OFF_WHITE },
  container: { flex: 1 },
  content: { paddingBottom: 20 },

  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ORANGE,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: WHITE,
  },

  // ── Hero Banner ─────────────────────────────────────────────────────────────
  heroBanner: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl + 8,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    backgroundColor: ORANGE,
    // Layered shadow
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  orbOrangeTR: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  orbBlueBL: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(41,182,232,0.22)',
  },
  orbWhiteCenter: {
    position: 'absolute',
    top: 20,
    left: '35%',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  heroBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md + 4,
  },
  logoRing: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: { width: 44, height: 44, borderRadius: 12 },
  greetingBox: { flex: 1 },
  greetingHello: {
    fontSize: 21,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 0.1,
  },
  greetingSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 3,
  },

  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  datePillText: {
    fontSize: 11,
    color: WHITE,
    fontWeight: '700',
  },
  dayPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dayPillText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },

  // ── Hero Media ──────────────────────────────────────────────────────────────
  heroMediaSection: {
    paddingHorizontal: SPACING.md,
    marginTop: -(SPACING.lg + 8),
    marginBottom: SPACING.xs,
  },
  heroBox: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#1A2438',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DARK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  heroScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(10,13,28,0.6)',
  },
  heroLiveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,60,60,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  heroLiveBadgeText: { fontSize: 11, fontWeight: '800', color: WHITE, letterSpacing: 1 },
  heroOrangeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: ORANGE,
  },
  heroTextWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.md + 6,
    gap: 6,
  },
  heroSubBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroSubBadgeText: { fontSize: 10, fontWeight: '800', color: WHITE },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: WHITE,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroFallback: { gap: SPACING.sm },
  heroFallbackOrb: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(41,182,232,0.18)',
  },
  heroFallbackLogoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  heroFallbackLogo: { width: 58, height: 58, borderRadius: 14 },
  heroFallbackTitle: { fontSize: 18, fontWeight: '800', color: WHITE },
  heroFallbackSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: 1 },

  // ── Rabbi Card ──────────────────────────────────────────────────────────────
  rabbiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: ORANGE_SOFT,
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  rabbiAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: ORANGE,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  rabbiAvatarWrap: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  rabbiPhoto: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ORANGE_SOFT,
  },
  rabbiOnlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: WHITE,
  },
  rabbiInfo: { flex: 1 },
  rabbiName: { fontSize: 15, fontWeight: '800', color: DARK },
  rabbiRole: { fontSize: 11, color: TEXT_SOFT, marginTop: 2 },
  rabbiTagRow: { flexDirection: 'row', gap: 6, marginTop: 5 },
  rabbiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: ORANGE_MID,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  rabbiTagText: { fontSize: 10, fontWeight: '700', color: ORANGE },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  waBtnText: { fontSize: 12, fontWeight: '800', color: WHITE },

  // ── Actions grid ────────────────────────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // ── Hayom Yom ───────────────────────────────────────────────────────────────
  hayomCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BLUE_SOFT,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  hayomTopBand: {
    height: 6,
    backgroundColor: BLUE,
  },
  hayomInner: {
    padding: SPACING.md,
  },
  hayomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  hayomDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  hayomDate: { fontSize: 11, fontWeight: '700', color: WHITE },
  hayomIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BLUE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hayomSeparator: {
    height: 2,
    backgroundColor: BLUE_SOFT,
    borderRadius: 1,
    marginBottom: SPACING.sm,
  },
  hayomText: {
    fontSize: 15,
    lineHeight: 26,
    color: TEXT_SOFT,
  },

  // ── Shiur rows ──────────────────────────────────────────────────────────────
  shiurRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: WHITE,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  shiurLeftBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 3,
    backgroundColor: ORANGE,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  shiurTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    minWidth: 54,
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  shiurTime: { fontSize: 12, fontWeight: '800', color: WHITE },
  shiurInfo: { flex: 1 },
  shiurTitle: { fontSize: 14, fontWeight: '700', color: DARK },
  shiurLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  shiurLoc: { fontSize: 11, color: TEXT_LIGHT },
  shiurAttend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  shiurAttendCount: { fontSize: 12, fontWeight: '700', color: BLUE_DEEP },

  noShiurCard: {
    backgroundColor: WHITE,
    padding: SPACING.lg,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: ORANGE_SOFT,
    gap: SPACING.xs,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  noShiurIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  noShiurEmoji: { fontSize: 28 },
  noShiurText: { fontSize: 14, color: TEXT_SOFT, fontWeight: '500' },
  noShiurBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: ORANGE,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  noShiurBtnText: { fontSize: 13, fontWeight: '700', color: WHITE },

  // ── CTA Card ─────────────────────────────────────────────────────────────────
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE_SOFT,
    padding: SPACING.md + 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${ORANGE}35`,
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaRing1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 24,
    borderColor: `${ORANGE}18`,
  },
  ctaRing2: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 12,
    borderColor: `${ORANGE}14`,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ctaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: DARK },
  ctaSub: { fontSize: 12, color: TEXT_SOFT, marginTop: 2 },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Promo Banner ─────────────────────────────────────────────────────────────
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BLUE_SOFT,
    padding: SPACING.md + 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${BLUE}30`,
    overflow: 'hidden',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
  promoOrb: {
    position: 'absolute',
    left: -30,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${BLUE}14`,
  },
  promoLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  promoIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  promoTitle: { fontSize: 15, fontWeight: '800', color: DARK },
  promoSub: { fontSize: 12, color: TEXT_SOFT, marginTop: 2 },
  promoArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${BLUE}30`,
  },
});
