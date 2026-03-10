import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import TopHeader from '../components/TopHeader';

const AVATARS = ['🧑', '👦', '👨', '🧒', '😊', '🤓', '📚', '✨'];

export default function ProfileScreen() {
  const { userName, userAvatar, setUserProfile } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(userAvatar);

  const handleSave = () => {
    setUserProfile(name, avatar);
    setEditing(false);
  };

  return (
    <View style={styles.wrapper}>
      <TopHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerBg} />
        <View style={styles.headerContent}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{userName ? userAvatar : '👤'}</Text>
          </View>
          <Text style={styles.title}>{userName || 'הפרופיל שלי'}</Text>
          <Text style={styles.sub}>{userName ? 'חב"ד לנוער נתיבות' : 'התחבר או הירשם לחשבון'}</Text>
        </View>
      </View>

      {!editing ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Feather name="user" size={20} color={COLORS.skyDark} />
            <View style={styles.rowText}>
              <Text style={styles.label}>שם</Text>
              <Text style={styles.value}>{userName || '—'}</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
              <Feather name="edit-2" size={16} color={COLORS.skyDark} />
              <Text style={styles.editText}>ערוך</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Feather name="bell" size={20} color={COLORS.skyDark} />
            <View style={styles.rowText}>
              <Text style={styles.label}>התראות</Text>
              <Text style={styles.value}>פעילות עבור שיעורים נבחרים</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Feather name="heart" size={20} color={COLORS.skyDark} />
            <View style={styles.rowText}>
              <Text style={styles.label}>חברותות מועדפות</Text>
              <Text style={styles.value}>{useAppStore.getState().favoriteChavruta.length} שמורות</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>עריכת פרופיל</Text>
          <TextInput
            style={styles.input}
            placeholder="הכנס את שמך"
            placeholderTextColor={COLORS.textLight}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.avatarLabel}>בחר אווטאר</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((a) => (
              <Pressable
                key={a}
                style={[styles.avatarOption, avatar === a && styles.avatarSelected]}
                onPress={() => setAvatar(a)}
              >
                <Text style={styles.avatarOptionText}>{a}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.editActions}>
            <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>ביטול</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>שמור</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.menuCard}>
        {[
          { icon: 'settings', label: 'הגדרות' },
          { icon: 'help-circle', label: 'עזרה' },
          { icon: 'info', label: 'אודות האפליקציה' },
        ].map((item) => (
          <Pressable key={item.label} style={styles.menuRow}>
            <Feather name={item.icon as any} size={20} color={COLORS.textMid} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-left" size={18} color={COLORS.textLight} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
        ))}
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
  header: { position: 'relative', marginHorizontal: -16, marginTop: -16, paddingTop: 56, paddingBottom: 32, marginBottom: 20 },
  headerBg: { position: 'absolute', top: 0, left: -20, right: -20, bottom: 0, backgroundColor: COLORS.charcoal },
  headerContent: { alignItems: 'center' },
  avatarWrap: { width: 88, height: 88, borderRadius: 24, backgroundColor: 'rgba(75,191,207,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarEmoji: { fontSize: 44 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: COLORS.textLight, marginBottom: 2 },
  value: { fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  editText: { fontSize: 14, fontWeight: '600', color: COLORS.skyDark },
  editCard: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  editTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 16 },
  input: { height: 48, backgroundColor: COLORS.offWhite, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 16, fontSize: 16, color: COLORS.textDark, marginBottom: 16 },
  avatarLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 10 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  avatarOption: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.offWhite, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: COLORS.sky, backgroundColor: 'rgba(75,191,207,0.1)' },
  avatarOptionText: { fontSize: 24 },
  editActions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  cancelText: { fontSize: 15, color: COLORS.textLight },
  saveBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.sky, borderRadius: BORDER_RADIUS.sm },
  saveText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  menuCard: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.textDark },
});
