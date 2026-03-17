import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons, Feather } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import {
  addNotification, addUpdate, addChabadHouse,
  addShiur, updateShiur, deleteShiur, getShiurim,
  getShiurComments, deleteShiurComment,
  getAppConfig, setAppConfig, uploadHeroMedia,
  uploadImage,
  addVolunteerRequest, getVolunteerRequests, deleteVolunteerRequest,
  getAllPushTokens,
  type ShiurDoc, type VolunteerRequestDoc, type AppConfigDoc,
} from '../services/firestore';
import { sendPushNotificationToAll } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { value: 'tanya', label: 'תניא' },
  { value: 'parasha', label: 'פרשה' },
  { value: 'halacha', label: 'הלכה' },
  { value: 'chassidut', label: 'חסידות' },
  { value: 'general', label: 'כללי' },
] as const;

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת', 'יומי', 'שני-חמישי'];
type HeroMediaType = NonNullable<AppConfigDoc['heroMediaType']>;
type HeroDraft = { uri: string; type: HeroMediaType };

function HeroVideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.heroPreview}
      nativeControls={false}
      contentFit="cover"
    />
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children, accent }: {
  title: string;
  icon: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <View style={[sec.wrap, accent ? { borderTopColor: accent, borderTopWidth: 3 } : {}]}>
      <Pressable style={sec.header} onPress={() => setOpen(!open)}>
        <Ionicons name={icon as any} size={18} color={accent ?? COLORS.sandDark} />
        <Text style={sec.title}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textLight} />
      </Pressable>
      {open && <View style={sec.body}>{children}</View>}
    </View>
  );
}

// ─── Shiur row in admin list ──────────────────────────────────────────────────
function ShiurAdminRow({ shiur, onEdit, onDelete }: {
  shiur: ShiurDoc;
  onEdit: (s: ShiurDoc) => void;
  onDelete: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Awaited<ReturnType<typeof getShiurComments>>>([]);

  const loadComments = async () => {
    if (!showComments) {
      const list = await getShiurComments(shiur.id);
      setComments(list);
    }
    setShowComments(!showComments);
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert('מחק תגובה', 'בטוח?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק', style: 'destructive', onPress: async () => {
          await deleteShiurComment(shiur.id, commentId);
          const list = await getShiurComments(shiur.id);
          setComments(list);
        },
      },
    ]);
  };

  return (
    <View style={sr.wrap}>
      <View style={sr.row}>
        <View style={sr.info}>
          <Text style={sr.title} numberOfLines={1}>{shiur.title}</Text>
          <Text style={sr.meta}>{shiur.day} · {shiur.time} · {shiur.location}</Text>
          <View style={sr.stats}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
            <Text style={sr.stat}>{shiur.rsvpUids.length} באים</Text>
            <Ionicons name="heart" size={12} color={COLORS.red} style={{ marginLeft: 8 }} />
            <Text style={sr.stat}>{shiur.likeUids.length} לייקים</Text>
          </View>
        </View>
        <View style={sr.btns}>
          <Pressable style={sr.editBtn} onPress={() => onEdit(shiur)}>
            <Ionicons name="create-outline" size={15} color={COLORS.sky} />
          </Pressable>
          <Pressable style={sr.deleteBtn} onPress={() => onDelete(shiur.id)}>
            <Ionicons name="trash-outline" size={15} color={COLORS.red} />
          </Pressable>
        </View>
      </View>
      <Pressable style={sr.commentsToggle} onPress={loadComments}>
        <Ionicons name="chatbubble-outline" size={13} color={COLORS.textLight} />
        <Text style={sr.commentsToggleText}>{showComments ? 'סגור תגובות' : 'נהל תגובות'}</Text>
      </Pressable>
      {showComments && (
        <View style={sr.commentsList}>
          {comments.length === 0 ? (
            <Text style={sr.noComments}>אין תגובות</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={sr.commentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={sr.commentName}>{c.displayName}</Text>
                  <Text style={sr.commentText}>{c.text}</Text>
                </View>
                <Pressable onPress={() => handleDeleteComment(c.id)}>
                  <Ionicons name="close" size={16} color={COLORS.red} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Volunteer request row ────────────────────────────────────────────────────
function VolunteerAdminRow({ req, onDelete }: {
  req: VolunteerRequestDoc;
  onDelete: (id: string) => void;
}) {
  const total = req.volunteerUids.length + req.anonymousCount;
  return (
    <View style={vr.wrap}>
      <View style={vr.row}>
        <View style={vr.info}>
          <Text style={vr.title} numberOfLines={1}>{req.title}</Text>
          <Text style={vr.meta}>{total} מתנדבים · צריך {req.spotsNeeded}</Text>
        </View>
        <Pressable style={vr.deleteBtn} onPress={() => onDelete(req.id)}>
          <Ionicons name="trash-outline" size={15} color={COLORS.red} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main AdminScreen ─────────────────────────────────────────────────────────
export default function AdminScreen() {
  const { user, profile } = useAuth();

  if (!profile?.isAdmin) {
    return (
      <View style={styles.wrapper}>
        <TopHeader showBack />
        <View style={styles.denied}>
          <Ionicons name="shield-outline" size={64} color={COLORS.red} />
          <Text style={styles.deniedTitle}>גישה חסומה</Text>
          <Text style={styles.deniedText}>מסך זה מיועד למנהלים בלבד (הרב מנחם ידגר).</Text>
        </View>
      </View>
    );
  }

  // ── Hero Image ──
  const [heroConfig, setHeroConfig] = useState<AppConfigDoc | null>(null);
  const [heroDraft, setHeroDraft] = useState<HeroDraft | null>(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [savingHero, setSavingHero] = useState(false);
  const [clearingHero, setClearingHero] = useState(false);

  // ── Push Notifications (real push) ──
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [sendingPush, setSendingPush] = useState(false);

  // ── Notifications (in-app feed) ──
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTime, setNotifTime] = useState('');
  const [notifDate, setNotifDate] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  // ── Updates ──
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateBody, setUpdateBody] = useState('');
  const [updateLocalUri, setUpdateLocalUri] = useState<string | null>(null);
  const [sendingUpdate, setSendingUpdate] = useState(false);

  // ── Shiurim ──
  const [shiurim, setShiurim] = useState<ShiurDoc[]>([]);
  const [loadingShiurim, setLoadingShiurim] = useState(true);
  const [editingShiur, setEditingShiur] = useState<ShiurDoc | null>(null);
  const [shiurTitle, setShiurTitle] = useState('');
  const [shiurDesc, setShiurDesc] = useState('');
  const [shiurTeacher, setShiurTeacher] = useState('הרב מנחם ידגר');
  const [shiurDay, setShiurDay] = useState('ראשון');
  const [shiurTime, setShiurTime] = useState('');
  const [shiurLocation, setShiurLocation] = useState('בית חב"ד נתיבות');
  const [shiurCategory, setShiurCategory] = useState<ShiurDoc['category']>('general');
  const [shiurLocalUri, setShiurLocalUri] = useState<string | null>(null);
  const [sendingShiur, setSendingShiur] = useState(false);

  // ── Volunteer Requests ──
  const [volunteerRequests, setVolunteerRequests] = useState<VolunteerRequestDoc[]>([]);
  const [loadingVolunteer, setLoadingVolunteer] = useState(true);
  const [volTitle, setVolTitle] = useState('');
  const [volBody, setVolBody] = useState('');
  const [volSpots, setVolSpots] = useState('1');
  const [sendingVol, setSendingVol] = useState(false);

  // ── Chabad Houses ──
  const [chabadName, setChabadName] = useState('');
  const [chabadContact, setChabadContact] = useState('');
  const [chabadPhone, setChabadPhone] = useState('');
  const [chabadLocation, setChabadLocation] = useState('');
  const [chabadLogoUrl, setChabadLogoUrl] = useState('');
  const [sendingChabad, setSendingChabad] = useState(false);

  // ── Load data ──
  const loadShiurim = useCallback(async () => {
    setLoadingShiurim(true);
    const list = await getShiurim();
    setShiurim(list);
    setLoadingShiurim(false);
  }, []);

  const loadVolunteer = useCallback(async () => {
    setLoadingVolunteer(true);
    const list = await getVolunteerRequests();
    setVolunteerRequests(list);
    setLoadingVolunteer(false);
  }, []);

  const loadHeroConfig = useCallback(async () => {
    const cfg = await getAppConfig();
    setHeroConfig(cfg);
    if (cfg) {
      setHeroTitle(cfg.heroTitle ?? '');
      setHeroSubtitle(cfg.heroSubtitle ?? '');
    }
  }, []);

  useEffect(() => {
    loadShiurim();
    loadVolunteer();
    loadHeroConfig();
  }, [loadShiurim, loadVolunteer, loadHeroConfig]);

  // ── Image picker helper ──
  const pickImage = async (
    onPick: (uri: string) => void,
    aspect: [number, number] = [4, 3]
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  const pickHeroMedia = async (type: HeroMediaType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [type === 'video' ? 'videos' : 'images'],
      allowsEditing: type === 'image',
      aspect: type === 'image' ? [16, 9] : undefined,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setHeroDraft({ uri: result.assets[0].uri, type });
    }
  };

  // ── Hero handlers ──
  const handleSaveHero = async () => {
    setSavingHero(true);
    const nextType = heroDraft?.type ?? heroConfig?.heroMediaType ?? (heroConfig?.heroVideoUrl ? 'video' : 'image');
    let imageUrl = heroConfig?.heroImageUrl ?? null;
    let videoUrl = heroConfig?.heroVideoUrl ?? null;

    if (heroDraft) {
      const uploaded = await uploadHeroMedia(heroDraft.uri, heroDraft.type);
      if (uploaded) {
        if (heroDraft.type === 'video') {
          videoUrl = uploaded;
          imageUrl = null;
        } else {
          imageUrl = uploaded;
          videoUrl = null;
        }
      }
      else {
        Alert.alert('שגיאה', 'העלאת המדיה נכשלה');
        setSavingHero(false);
        return;
      }
    }
    const ok = await setAppConfig({
      heroMediaType: nextType,
      heroImageUrl: imageUrl,
      heroVideoUrl: videoUrl,
      heroTitle: heroTitle.trim() || undefined,
      heroSubtitle: heroSubtitle.trim() || undefined,
    });
    setSavingHero(false);
    if (ok) {
      setHeroDraft(null);
      await loadHeroConfig();
      Alert.alert('נשמר', 'הנושא המרכזי עודכן');
    } else {
      Alert.alert('שגיאה', 'לא הצלחנו לשמור. בדוק חיבור ל-Firebase.');
    }
  };

  const handleClearHero = async () => {
    setClearingHero(true);
    const ok = await setAppConfig({
      heroMediaType: undefined,
      heroImageUrl: null,
      heroVideoUrl: null,
    });
    setClearingHero(false);
    if (ok) {
      setHeroDraft(null);
      setHeroConfig((prev) => prev ? { ...prev, heroImageUrl: null, heroVideoUrl: null, heroMediaType: undefined } : prev);
      Alert.alert('נמחק', 'התמונה/הסרטון של הנושא המרכזי הוסרו. ניתן יהיה להעלות מחדש מתוך האפליקציה.');
    } else {
      Alert.alert('שגיאה', 'לא הצלחנו למחוק את הנושא המרכזי. בדוק חיבור ל-Firebase.');
    }
  };

  // ── Push notification handler ──
  const handleSendPush = async () => {
    if (!pushTitle.trim()) { Alert.alert('חסר', 'הכנס כותרת להתראה'); return; }
    setSendingPush(true);
    const tokens = await getAllPushTokens();
    if (tokens.length === 0) {
      Alert.alert('אין נמענים', 'לא נמצאו מכשירים רשומים לקבלת התראות.');
      setSendingPush(false);
      return;
    }
    const ok = await sendPushNotificationToAll(pushTitle.trim(), pushBody.trim(), tokens);
    setSendingPush(false);
    if (ok) {
      setPushTitle('');
      setPushBody('');
      Alert.alert('נשלח!', `ההתראה נשלחה ל-${tokens.length} מכשירים`);
    } else {
      Alert.alert('שגיאה', 'שליחת ההתראה נכשלה. בדוק את הגדרות ה-Expo Push.');
    }
  };

  // ── Notification (in-app) handlers ──
  const handleAddNotification = async () => {
    if (!notifTitle.trim()) { Alert.alert('חסר', 'הכנס כותרת להתראה'); return; }
    if (!user) { Alert.alert('לא מחובר'); return; }
    setSendingNotif(true);
    const id = await addNotification({
      title: notifTitle.trim(),
      body: notifBody.trim() || undefined,
      time: notifTime.trim() || '—',
      date: notifDate.trim() || new Date().toLocaleDateString('he-IL'),
    });
    setSendingNotif(false);
    if (id) {
      setNotifTitle(''); setNotifBody(''); setNotifTime(''); setNotifDate('');
      Alert.alert('נשלח', 'ההתראה פורסמה בפיד');
    } else Alert.alert('שגיאה', 'לא הצלחנו לפרסם. בדוק חיבור ל-Firebase.');
  };

  // ── Update handlers ──
  const handleAddUpdate = async () => {
    if (!updateTitle.trim()) { Alert.alert('חסר', 'הכנס כותרת לעדכון'); return; }
    if (!user) { Alert.alert('לא מחובר'); return; }
    setSendingUpdate(true);
    let imageUrl: string | undefined;
    if (updateLocalUri) {
      const uploaded = await uploadImage(
        `updates/${Date.now()}.jpg`,
        updateLocalUri
      );
      if (uploaded) imageUrl = uploaded;
    }
    const id = await addUpdate({
      title: updateTitle.trim(),
      body: updateBody.trim() || undefined,
      imageUrl,
    });
    setSendingUpdate(false);
    if (id) {
      setUpdateTitle(''); setUpdateBody(''); setUpdateLocalUri(null);
      Alert.alert('נשלח', 'העדכון פורסם');
    } else Alert.alert('שגיאה', 'לא הצלחנו לפרסם. בדוק חיבור ל-Firebase.');
  };

  // ── Shiur handlers ──
  const resetShiurForm = () => {
    setEditingShiur(null);
    setShiurTitle(''); setShiurDesc('');
    setShiurTeacher('הרב מנחם ידגר');
    setShiurDay('ראשון'); setShiurTime('');
    setShiurLocation('בית חב"ד נתיבות');
    setShiurCategory('general');
    setShiurLocalUri(null);
  };

  const startEdit = (s: ShiurDoc) => {
    setEditingShiur(s);
    setShiurTitle(s.title);
    setShiurDesc(s.description ?? '');
    setShiurTeacher(s.teacher);
    setShiurDay(s.day);
    setShiurTime(s.time);
    setShiurLocation(s.location);
    setShiurCategory(s.category);
    setShiurLocalUri(null);
  };

  const handleSaveShiur = async () => {
    if (!shiurTitle.trim() || !shiurTime.trim()) {
      Alert.alert('חסר', 'הכנס לפחות כותרת ושעה');
      return;
    }
    if (!user) { Alert.alert('לא מחובר'); return; }
    setSendingShiur(true);

    let imageUrl: string | undefined = editingShiur?.imageUrl;
    if (shiurLocalUri) {
      const uploaded = await uploadImage(
        `shiurim/${Date.now()}.jpg`,
        shiurLocalUri
      );
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      title: shiurTitle.trim(),
      description: shiurDesc.trim() || undefined,
      teacher: shiurTeacher.trim(),
      day: shiurDay,
      time: shiurTime.trim(),
      location: shiurLocation.trim(),
      category: shiurCategory,
      imageUrl,
    };
    let ok = false;
    if (editingShiur) {
      ok = await updateShiur(editingShiur.id, payload);
    } else {
      const id = await addShiur(payload);
      ok = !!id;
    }
    setSendingShiur(false);
    if (ok) {
      resetShiurForm();
      await loadShiurim();
      Alert.alert('נשמר', editingShiur ? 'השיעור עודכן' : 'השיעור נוסף');
    } else Alert.alert('שגיאה', 'לא הצלחנו לשמור. בדוק חיבור ל-Firebase.');
  };

  const handleDeleteShiur = (id: string) => {
    Alert.alert('מחק שיעור', 'בטוח שרוצה למחוק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק', style: 'destructive', onPress: async () => {
          await deleteShiur(id);
          await loadShiurim();
        },
      },
    ]);
  };

  const handleToggleActive = async (s: ShiurDoc) => {
    await updateShiur(s.id, { active: !s.active });
    await loadShiurim();
  };

  // ── Volunteer handlers ──
  const handleAddVolunteer = async () => {
    if (!volTitle.trim()) { Alert.alert('חסר', 'הכנס כותרת לבקשה'); return; }
    setSendingVol(true);
    const id = await addVolunteerRequest({
      title: volTitle.trim(),
      body: volBody.trim(),
      spotsNeeded: parseInt(volSpots, 10) || 1,
    });
    setSendingVol(false);
    if (id) {
      setVolTitle(''); setVolBody(''); setVolSpots('1');
      await loadVolunteer();
      Alert.alert('נוסף', 'בקשת ההתנדבות פורסמה');
    } else Alert.alert('שגיאה', 'לא הצלחנו לפרסם.');
  };

  const handleDeleteVolunteer = (id: string) => {
    Alert.alert('מחק בקשה', 'בטוח?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק', style: 'destructive', onPress: async () => {
          await deleteVolunteerRequest(id);
          await loadVolunteer();
        },
      },
    ]);
  };

  // ── Chabad House handler ──
  const handleAddChabadHouse = async () => {
    if (!chabadName.trim() || !chabadContact.trim() || !chabadPhone.trim() || !chabadLocation.trim()) {
      Alert.alert('חסר', 'מלא שם, איש קשר, טלפון ומיקום');
      return;
    }
    if (!user) { Alert.alert('לא מחובר'); return; }
    setSendingChabad(true);
    const id = await addChabadHouse({
      name: chabadName.trim(), contactName: chabadContact.trim(),
      phone: chabadPhone.trim(), location: chabadLocation.trim(),
      logoUrl: chabadLogoUrl.trim() || undefined,
    });
    setSendingChabad(false);
    if (id) {
      setChabadName(''); setChabadContact(''); setChabadPhone('');
      setChabadLocation(''); setChabadLogoUrl('');
      Alert.alert('נוסף', 'בית חב"ד נוסף לרשימה');
    } else Alert.alert('שגיאה', 'לא הצלחנו להוסיף. בדוק חיבור ל-Firebase.');
  };

  // ─── Current hero preview ─────────────────────────────────────────────────
  const heroPreviewType = heroDraft?.type ?? heroConfig?.heroMediaType ?? (heroConfig?.heroVideoUrl ? 'video' : 'image');
  const heroPreviewUri = heroDraft?.uri
    ?? (heroPreviewType === 'video' ? heroConfig?.heroVideoUrl : heroConfig?.heroImageUrl)
    ?? null;

  return (
    <View style={styles.wrapper}>
      <TopHeader showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>מסך ניהול</Text>
          <Text style={styles.sub}>להרב מנחם ידגר · שליטה מלאה</Text>
        </View>

        {/* ── Hero Image / Video ── */}
        <Section title="נושא מרכזי (מסך הבית)" icon="image" accent="#E8A96A">
          <Text style={styles.sectionSub}>
            האדמין יכול להעלות תמונה או סרטון שמוצגים בראש מסך הבית בפורמט 16:9.
          </Text>
          <View style={styles.heroMediaActions}>
            <Pressable style={styles.heroMediaBtn} onPress={() => pickHeroMedia('image')}>
              <Ionicons name="image-outline" size={18} color={COLORS.sandDark} />
              <Text style={styles.heroMediaBtnText}>בחר תמונה</Text>
            </Pressable>
            <Pressable style={styles.heroMediaBtn} onPress={() => pickHeroMedia('video')}>
              <Ionicons name="videocam-outline" size={18} color={COLORS.sandDark} />
              <Text style={styles.heroMediaBtnText}>בחר סרטון</Text>
            </Pressable>
          </View>
          {heroPreviewUri ? (
            <Pressable>
              {heroPreviewType === 'video' ? (
                <HeroVideoPreview uri={heroPreviewUri} />
              ) : (
                <Image source={{ uri: heroPreviewUri }} style={styles.heroPreview} resizeMode="cover" />
              )}
              <View style={styles.heroChangeOverlay}>
                <Ionicons name={heroPreviewType === 'video' ? 'videocam' : 'camera'} size={22} color="#fff" />
                <Text style={styles.heroChangeText}>
                  {heroPreviewType === 'video' ? 'סרטון נבחר' : 'תמונה נבחרה'}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable style={styles.heroPlaceholder} onPress={() => pickHeroMedia('image')}>
              <Ionicons name="image-outline" size={36} color={COLORS.textLight} />
              <Text style={styles.heroPlaceholderText}>בחר תמונה או סרטון לנושא המרכזי</Text>
            </Pressable>
          )}
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="כותרת על התמונה (אופציונלי)"
            placeholderTextColor={COLORS.textLight}
            value={heroTitle}
            onChangeText={setHeroTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="תת-כותרת (אופציונלי)"
            placeholderTextColor={COLORS.textLight}
            value={heroSubtitle}
            onChangeText={setHeroSubtitle}
          />
          <View style={styles.heroButtonsRow}>
            <Pressable
              style={[styles.btn, { backgroundColor: COLORS.sandDark }, savingHero && styles.btnDisabled]}
              onPress={handleSaveHero}
              disabled={savingHero}
            >
              {savingHero ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="save" size={18} color="#fff" />
              )}
              <Text style={styles.btnText}>{savingHero ? 'שומר...' : 'שמור נושא מרכזי'}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnDanger, (clearingHero || (!heroConfig?.heroImageUrl && !heroConfig?.heroVideoUrl)) && styles.btnDisabled]}
              onPress={handleClearHero}
              disabled={clearingHero || (!heroConfig?.heroImageUrl && !heroConfig?.heroVideoUrl)}
            >
              {clearingHero ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="trash" size={18} color="#fff" />
              )}
              <Text style={styles.btnText}>{clearingHero ? 'מוחק...' : 'מחק נושא מרכזי'}</Text>
            </Pressable>
          </View>
        </Section>

        {/* ── Push Notifications (real device push) ── */}
        <Section title="שלח PUSH לכולם" icon="notifications" accent={COLORS.sky}>
          <Text style={styles.sectionSub}>
            שולח התראה לכל המשתמשים הרשומים (iOS + Android). ההתראה מופיעה גם כשהאפליקציה סגורה.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="כותרת ההתראה"
            placeholderTextColor={COLORS.textLight}
            value={pushTitle}
            onChangeText={setPushTitle}
          />
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="תוכן ההתראה"
            placeholderTextColor={COLORS.textLight}
            value={pushBody}
            onChangeText={setPushBody}
            multiline
          />
          <Pressable
            style={[styles.btn, { backgroundColor: COLORS.sky }, sendingPush && styles.btnDisabled]}
            onPress={handleSendPush}
            disabled={sendingPush}
          >
            {sendingPush ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
            <Text style={styles.btnText}>{sendingPush ? 'שולח...' : 'שלח התראה לכולם'}</Text>
          </Pressable>
        </Section>

        {/* ── Volunteer Requests ── */}
        <Section title="ניהול בקשות התנדבות" icon="heart" accent={COLORS.red}>
          <Text style={styles.sectionSub}>פרסם בקשות לנוער: "צריך מתנדב לרכישת מצרכים" וכו'.</Text>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>בקשה חדשה</Text>
            <TextInput
              style={styles.input}
              placeholder="כותרת (למשל: צריך מתנדב לחלוקת מנות)"
              placeholderTextColor={COLORS.textLight}
              value={volTitle}
              onChangeText={setVolTitle}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="פרטים נוספים"
              placeholderTextColor={COLORS.textLight}
              value={volBody}
              onChangeText={setVolBody}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="כמה מתנדבים נדרשים?"
              placeholderTextColor={COLORS.textLight}
              value={volSpots}
              onChangeText={setVolSpots}
              keyboardType="number-pad"
            />
            <Pressable
              style={[styles.btn, { backgroundColor: COLORS.red }, sendingVol && styles.btnDisabled]}
              onPress={handleAddVolunteer}
              disabled={sendingVol}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.btnText}>{sendingVol ? 'מפרסם...' : 'פרסם בקשת התנדבות'}</Text>
            </Pressable>
          </View>

          <Text style={styles.listTitle}>בקשות פעילות ({volunteerRequests.length})</Text>
          {loadingVolunteer ? (
            <ActivityIndicator color={COLORS.red} style={{ marginVertical: 12 }} />
          ) : volunteerRequests.length === 0 ? (
            <Text style={styles.emptyList}>אין בקשות התנדבות פעילות</Text>
          ) : (
            volunteerRequests.map((r) => (
              <VolunteerAdminRow key={r.id} req={r} onDelete={handleDeleteVolunteer} />
            ))
          )}
        </Section>

        {/* ── Shiurim ── */}
        <Section title="ניהול שיעורים" icon="book" accent={COLORS.blue}>
          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingShiur ? 'עריכת שיעור' : 'הוסף שיעור חדש'}</Text>
            <TextInput style={styles.input} placeholder="כותרת השיעור" placeholderTextColor={COLORS.textLight} value={shiurTitle} onChangeText={setShiurTitle} />
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder="תיאור (אופציונלי)" placeholderTextColor={COLORS.textLight} value={shiurDesc} onChangeText={setShiurDesc} multiline />
            <TextInput style={styles.input} placeholder="מרצה" placeholderTextColor={COLORS.textLight} value={shiurTeacher} onChangeText={setShiurTeacher} />
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.inputHalf]} placeholder="שעה (20:00)" placeholderTextColor={COLORS.textLight} value={shiurTime} onChangeText={setShiurTime} />
              <TextInput style={[styles.input, styles.inputHalf]} placeholder="מיקום" placeholderTextColor={COLORS.textLight} value={shiurLocation} onChangeText={setShiurLocation} />
            </View>
            {/* Day picker */}
            <Text style={styles.pickerLabel}>יום</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.chipRow}>
                {DAYS.map((d) => (
                  <Pressable key={d} style={[styles.chip, shiurDay === d && styles.chipActive]} onPress={() => setShiurDay(d)}>
                    <Text style={[styles.chipText, shiurDay === d && styles.chipTextActive]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {/* Category picker */}
            <Text style={styles.pickerLabel}>קטגוריה</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <Pressable key={c.value} style={[styles.chip, shiurCategory === c.value && styles.chipActive]} onPress={() => setShiurCategory(c.value)}>
                  <Text style={[styles.chipText, shiurCategory === c.value && styles.chipTextActive]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
            {/* Image picker for shiur */}
            <Pressable
              style={styles.imagePickerBtn}
              onPress={() => pickImage(setShiurLocalUri, [4, 3])}
            >
              {shiurLocalUri ? (
                <Image source={{ uri: shiurLocalUri }} style={styles.imagePickerPreview} resizeMode="cover" />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={20} color={COLORS.textLight} />
                  <Text style={styles.imagePickerText}>
                    {editingShiur?.imageUrl ? 'החלף תמונה לשיעור' : 'הוסף תמונה לשיעור (אופציונלי)'}
                  </Text>
                </>
              )}
            </Pressable>
            <View style={styles.formBtns}>
              <Pressable style={[styles.btn, sendingShiur && styles.btnDisabled]} onPress={handleSaveShiur} disabled={sendingShiur}>
                {sendingShiur ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name={editingShiur ? 'save' : 'add-circle'} size={18} color="#fff" />
                )}
                <Text style={styles.btnText}>{sendingShiur ? 'שומר...' : editingShiur ? 'שמור שינויים' : 'הוסף שיעור'}</Text>
              </Pressable>
              {editingShiur && (
                <Pressable style={[styles.btn, styles.btnGray]} onPress={resetShiurForm}>
                  <Ionicons name="close" size={18} color="#fff" />
                  <Text style={styles.btnText}>ביטול</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Existing shiurim */}
          <Text style={styles.listTitle}>שיעורים קיימים ({shiurim.length})</Text>
          {loadingShiurim ? (
            <ActivityIndicator color={COLORS.sky} style={{ marginVertical: 12 }} />
          ) : shiurim.length === 0 ? (
            <Text style={styles.emptyList}>עדיין אין שיעורים</Text>
          ) : (
            shiurim.map((s) => (
              <View key={s.id}>
                <Pressable style={styles.activeToggle} onPress={() => handleToggleActive(s)}>
                  <View style={[styles.activeDot, { backgroundColor: s.active ? COLORS.green : COLORS.textLight }]} />
                  <Text style={styles.activeLabel}>{s.active ? 'פעיל' : 'מוסתר'}</Text>
                </Pressable>
                <ShiurAdminRow shiur={s} onEdit={startEdit} onDelete={handleDeleteShiur} />
              </View>
            ))
          )}
        </Section>

        {/* ── In-App Notifications ── */}
        <Section title="פיד התראות (תוך-אפליקציה)" icon="notifications-outline" accent="#9B59B6">
          <Text style={styles.sectionSub}>התראה שתופיע במסך ההתראות בתוך האפליקציה (לא push).</Text>
          <TextInput style={styles.input} placeholder="כותרת" placeholderTextColor={COLORS.textLight} value={notifTitle} onChangeText={setNotifTitle} />
          <TextInput style={[styles.input, styles.inputMultiline]} placeholder="תוכן (אופציונלי)" placeholderTextColor={COLORS.textLight} value={notifBody} onChangeText={setNotifBody} multiline />
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.inputHalf]} placeholder="שעה" placeholderTextColor={COLORS.textLight} value={notifTime} onChangeText={setNotifTime} />
            <TextInput style={[styles.input, styles.inputHalf]} placeholder="תאריך" placeholderTextColor={COLORS.textLight} value={notifDate} onChangeText={setNotifDate} />
          </View>
          <Pressable style={[styles.btn, { backgroundColor: '#9B59B6' }, sendingNotif && styles.btnDisabled]} onPress={handleAddNotification} disabled={sendingNotif}>
            <Ionicons name="notifications" size={18} color="#fff" />
            <Text style={styles.btnText}>{sendingNotif ? 'שולח...' : 'פרסם בפיד'}</Text>
          </Pressable>
        </Section>

        {/* ── Updates ── */}
        <Section title="פרסם עדכון / תמונה" icon="images" accent={COLORS.green}>
          <TextInput style={styles.input} placeholder="כותרת" placeholderTextColor={COLORS.textLight} value={updateTitle} onChangeText={setUpdateTitle} />
          <TextInput style={[styles.input, styles.inputMultiline]} placeholder="תוכן (אופציונלי)" placeholderTextColor={COLORS.textLight} value={updateBody} onChangeText={setUpdateBody} multiline />
          <Pressable
            style={styles.imagePickerBtn}
            onPress={() => pickImage(setUpdateLocalUri, [4, 3])}
          >
            {updateLocalUri ? (
              <Image source={{ uri: updateLocalUri }} style={styles.imagePickerPreview} resizeMode="cover" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={20} color={COLORS.textLight} />
                <Text style={styles.imagePickerText}>הוסף תמונה לעדכון (אופציונלי)</Text>
              </>
            )}
          </Pressable>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.green }, sendingUpdate && styles.btnDisabled]} onPress={handleAddUpdate} disabled={sendingUpdate}>
            {sendingUpdate ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="image" size={18} color="#fff" />
            )}
            <Text style={styles.btnText}>{sendingUpdate ? 'שולח...' : 'פרסם עדכון'}</Text>
          </Pressable>
        </Section>

        {/* ── Chabad Houses ── */}
        <Section title='בתי חב"ד בעיר' icon="home" accent={COLORS.sandDark}>
          <Text style={styles.sectionSub}>הוסף בית חב"ד שיופיע בתפריט הצד.</Text>
          <TextInput style={styles.input} placeholder='שם בית חב"ד' placeholderTextColor={COLORS.textLight} value={chabadName} onChangeText={setChabadName} />
          <TextInput style={styles.input} placeholder="שם איש קשר" placeholderTextColor={COLORS.textLight} value={chabadContact} onChangeText={setChabadContact} />
          <TextInput style={styles.input} placeholder="טלפון" placeholderTextColor={COLORS.textLight} value={chabadPhone} onChangeText={setChabadPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="מיקום / כתובת" placeholderTextColor={COLORS.textLight} value={chabadLocation} onChangeText={setChabadLocation} />
          <TextInput style={styles.input} placeholder="קישור ללוגו (אופציונלי)" placeholderTextColor={COLORS.textLight} value={chabadLogoUrl} onChangeText={setChabadLogoUrl} autoCapitalize="none" keyboardType="url" />
          <Pressable style={[styles.btn, { backgroundColor: COLORS.sandDark }, sendingChabad && styles.btnDisabled]} onPress={handleAddChabadHouse} disabled={sendingChabad}>
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={styles.btnText}>{sendingChabad ? 'שולח...' : 'הוסף בית חב"ד'}</Text>
          </Pressable>
        </Section>

        <View style={styles.note}>
          <Ionicons name="cloud" size={20} color={COLORS.sandDark} />
          <Text style={styles.noteText}>כל הנתונים נשמרים ב-Firestore ומתעדכנים בזמן אמת.</Text>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  iconWrap: { width: 72, height: 72, borderRadius: 24, backgroundColor: COLORS.charcoal, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textDark },
  sub: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  formCard: { backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm, padding: 12, marginBottom: 14 },
  formTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 10 },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  listTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyList: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', paddingVertical: 12 },
  activeToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  activeLabel: { fontSize: 11, color: COLORS.textLight },
  input: { height: 44, backgroundColor: '#fff', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 14, fontSize: 15, color: COLORS.textDark, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  inputMultiline: { minHeight: 60, paddingTop: 10, height: undefined },
  row: { flexDirection: 'row', gap: 10 },
  inputHalf: { flex: 1 },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipActive: { backgroundColor: COLORS.charcoal, borderColor: COLORS.charcoal },
  chipText: { fontSize: 13, color: COLORS.textMid, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.charcoal, paddingVertical: 12, borderRadius: BORDER_RADIUS.sm, flex: 1 },
  btnGray: { backgroundColor: COLORS.textLight, flex: 0, paddingHorizontal: 18 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnDanger: { backgroundColor: COLORS.red },
  heroButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  sectionSub: { fontSize: 12, color: COLORS.textLight, marginBottom: 10, lineHeight: 18 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, padding: 16, backgroundColor: 'rgba(232,169,106,0.12)', borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: 'rgba(232,169,106,0.25)' },
  noteText: { fontSize: 13, color: COLORS.textMid, flex: 1 },
  denied: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite, gap: 16 },
  deniedTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textDark },
  deniedText: { fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
  // Hero
  heroPreview: { width: '100%', aspectRatio: 16 / 9, borderRadius: BORDER_RADIUS.sm, marginBottom: 4 },
  heroMediaActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  heroMediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, backgroundColor: 'rgba(232,169,106,0.12)', borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: 'rgba(232,169,106,0.3)' },
  heroMediaBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.sandDark },
  heroChangeOverlay: { position: 'absolute', bottom: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  heroChangeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  heroPlaceholder: { width: '100%', aspectRatio: 16 / 9, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.offWhite, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
  heroPlaceholderText: { fontSize: 13, color: COLORS.textLight },
  // Image picker
  imagePickerBtn: { width: '100%', height: 80, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.offWhite, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 10 },
  imagePickerPreview: { width: '100%', height: 80, borderRadius: BORDER_RADIUS.sm },
  imagePickerText: { fontSize: 13, color: COLORS.textLight },
});

const sec = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: '#fff' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  body: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: COLORS.border },
});

const sr = StyleSheet.create({
  wrap: { backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textDark },
  meta: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  stat: { fontSize: 12, color: COLORS.textMid },
  btns: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${COLORS.sky}18`, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${COLORS.red}18`, alignItems: 'center', justifyContent: 'center' },
  commentsToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  commentsToggleText: { fontSize: 12, color: COLORS.textLight },
  commentsList: { marginTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  noComments: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', paddingVertical: 6 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  commentName: { fontSize: 11, fontWeight: '700', color: COLORS.sandDark },
  commentText: { fontSize: 13, color: COLORS.textMid },
});

const vr = StyleSheet.create({
  wrap: { backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  meta: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: `${COLORS.red}18`, alignItems: 'center', justifyContent: 'center' },
});
