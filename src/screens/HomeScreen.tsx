import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVisits, setLoading } from '../store/slices/visitSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { residentialGraph } from '../structures';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { user } = useAuth();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const visits = useAppSelector(state => state.visits.list);
  const loading = useAppSelector(state => state.visits.loading);

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.created_at.startsWith(today)).length;
  const totalVisits = visits.length;

  // Obtener ruta desde el Grafo para la última visita registrada si existe
  const lastVisit = visits[0];
  const routeToLastVisit = lastVisit ? residentialGraph.findPath("Entrada", lastVisit.house) : [];

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
  dispatch(setLoading(true));
  console.log('[Redux] HomeScreen - cargando visitas del usuario...');

  let query = supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false });

  // Admin ve todas, residente solo las suyas
  if (profile?.role === 'residente') {
    query = query.eq('user_id', user?.id);
  }

  const { data, error } = await query;

  if (!error) {
    dispatch(setVisits(data ?? []));
    console.log('[Redux] HomeScreen - visitas cargadas:', data?.length);
  }
  dispatch(setLoading(false));
};

  const QuickAction = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.greeting}>{t('welcome')} 👋</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayVisits}</Text>
          <Text style={styles.statLabel}>{t('today')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalVisits}</Text>
          <Text style={styles.statLabel}>{t('total')}</Text>
        </View>
      </View>

      {lastVisit && (
        <View style={styles.routeCard}>
          <Text style={styles.routeTitle}>📍 Próxima Visita: {lastVisit.name}</Text>
          <Text style={styles.routeText}>
            Ruta: {routeToLastVisit.length > 0 ? routeToLastVisit.join(' → ') : 'Sin ruta directa'}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
<View style={styles.actionsGrid}>
  {(profile?.role === 'residente' || profile?.role === 'admin') && (
    <QuickAction
      icon="📝"
      label={t('registerVisit')}
      onPress={() => navigation.navigate('RegisterVisit')}
    />
  )}
  {(profile?.role === 'guardia' || profile?.role === 'admin') && (
    <QuickAction
      icon="📷"
      label={t('scanQR')}
      onPress={() => navigation.navigate('MainTabs', { screen: 'ScanQR' } as any)}
    />
  )}
</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 24 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  email: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statNumber: { fontSize: 36, fontWeight: '800', color: '#2563EB' },
  statLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
  routeCard: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  routeTitle: { color: '#FFF', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  routeText: { color: '#DBEAFE', fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#334155', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  action: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#334155', textAlign: 'center' },
});

export default HomeScreen;