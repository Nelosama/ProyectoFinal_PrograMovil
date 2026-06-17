import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVisits, setLoading } from '../store/slices/visitSlice';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const HistoryScreen = () => {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const visits = useAppSelector(state => state.visits.list);
  const loading = useAppSelector(state => state.visits.loading);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied' | 'checked_out'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    dispatch(setLoading(true));
    console.log('[Redux] HistoryScreen - consultando Supabase...');

    let query = supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // Admin ve todas, residente solo las suyas
    if (profile?.role === 'residente') {
      query = query.eq('user_id', user?.id);
    }

    const { data, error } = await query;

    if (!error) {
      dispatch(setVisits(data ?? []));
      console.log('[Redux] HistoryScreen - estado global actualizado con', data?.length, 'visitas');
    }
    dispatch(setLoading(false));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-GT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredVisits = filter === 'all'
    ? visits
    : visits.filter(v => v.status === filter);

  const renderItem = ({ item }: { item: any }) => {
    const getBadgeStyle = () => {
      switch(item.status) {
        case 'approved': return styles.approved;
        case 'denied': return styles.denied;
        case 'checked_out': return styles.checkedOut;
        default: return styles.pending;
      }
    };

    const getStatusText = () => {
      switch(item.status) {
        case 'approved': return t('approved');
        case 'denied': return 'Denegado';
        case 'checked_out': return 'Salida';
        default: return t('pending');
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>🏠 Casa {item.house}</Text>
          <Text style={styles.date}>🕐 {formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.badge, getBadgeStyle()]}>
          <Text style={styles.badgeText}>{getStatusText()}</Text>
        </View>
      </View>
    );
  };

  const FilterChip = ({ label, value }: { label: string, value: typeof filter }) => (
    <TouchableOpacity
      style={[styles.chip, filter === value && styles.chipActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.chipText, filter === value && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{t('visitHistory')}</Text>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip label="Todos" value="all" />
          <FilterChip label="Pendientes" value="pending" />
          <FilterChip label="Aprobados" value="approved" />
          <FilterChip label="Denegados" value="denied" />
          <FilterChip label="Salida" value="checked_out" />
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{t('noHistory')}</Text>}
          onRefresh={fetchHistory}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B', padding: 24, paddingBottom: 12 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  meta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  date: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  approved: { backgroundColor: '#DCFCE7' },
  pending: { backgroundColor: '#FEF9C3' },
  denied: { backgroundColor: '#FEE2E2' },
  checkedOut: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  filterContainer: { paddingHorizontal: 24, paddingBottom: 16, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 60, fontSize: 15 },
});

export default HistoryScreen;
