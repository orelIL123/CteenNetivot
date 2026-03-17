import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TopHeader from '../components/TopHeader';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import { getChabadHouses, ChabadHouseDoc } from '../services/firestore';

function ChabadHouseCard({ house }: { house: ChabadHouseDoc }) {
  const handleCall = () => house.phone && Linking.openURL(`tel:${house.phone.replace(/\s/g, '')}`);

  return (
    <View style={styles.card}>
      {house.logoUrl ? (
        <Image source={{ uri: house.logoUrl }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Feather name="home" size={28} color={COLORS.sandDark} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{house.name}</Text>
        <Text style={styles.cardContact}>{house.contactName}</Text>
        {house.location ? (
          <View style={styles.row}>
            <Feather name="map-pin" size={14} color={COLORS.textLight} />
            <Text style={styles.cardLocation}>{house.location}</Text>
          </View>
        ) : null}
        {house.phone ? (
          <Pressable style={styles.phoneRow} onPress={handleCall}>
            <Feather name="phone" size={14} color={COLORS.sky} />
            <Text style={styles.phoneText}>{house.phone}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function ChabadHousesScreen() {
  const [houses, setHouses] = useState<ChabadHouseDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChabadHouses().then((list) => {
      setHouses(list);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <TopHeader showBack />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Feather name="home" size={28} color="#fff" />
          </View>
          <Text style={styles.title}>בתי חב"ד נוספים בעיר</Text>
          <Text style={styles.sub}>נתיבות והסביבה — לוגו, איש קשר, טלפון ומיקום</Text>
        </View>

        {loading ? (
          <Text style={styles.loading}>טוען...</Text>
        ) : houses.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="info" size={40} color={COLORS.textLight} />
            <Text style={styles.emptyText}>עדיין לא נוספו בתי חב"ד. הרב יכול להוסיף ממסך הניהול.</Text>
          </View>
        ) : (
          houses.map((house) => <ChabadHouseCard key={house.id} house={house} />)
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { padding: 16, paddingBottom: 20 },
  header: {
    marginHorizontal: -16,
    marginTop: -16,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginBottom: 16,
    backgroundColor: COLORS.charcoal,
  },
  headerIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  loading: { textAlign: 'center', color: COLORS.textLight, marginTop: 24 },
  empty: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 14, color: COLORS.textMid, marginTop: 12, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  logo: { width: 56, height: 56, borderRadius: 14 },
  logoPlaceholder: { width: 56, height: 56, borderRadius: 14, backgroundColor: `${COLORS.sand}25`, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  cardContact: { fontSize: 14, color: COLORS.textMid, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  cardLocation: { fontSize: 13, color: COLORS.textLight, flex: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  phoneText: { fontSize: 14, fontWeight: '600', color: COLORS.sky },
});
