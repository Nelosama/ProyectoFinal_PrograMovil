import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { supabase } from '../lib/supabase';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setVisits, setLoading } from '../store/slices/visitSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { visitList, visitBST } from '../structures';
import { Visit } from '../store/slices/visitSlice';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VisitorsScreen = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const visitsFromRedux = useAppSelector(state => state.visits.list);
  const loading = useAppSelector(state => state.visits.loading);

  const [searchQuery, setSearchQuery] = useState('');
  const [displayList, setDisplayList] = useState<Visit[]>([]);

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Actualizar LinkedList y BST cuando cambian las visitas de Redux
  useEffect(() => {
    // Limpiar estructuras manuales
    while(visitList.size() > 0) {
      const first = visitList.toArray()[0];
      if (first) visitList.delete(first.id);
      else break;
    }
    visitBST.clear();

    // Poblar estructuras
    visitsFromRedux.forEach(v => {
      visitList.insert(v);
      visitBST.insert(v);
    });

    // Por defecto mostramos el arreglo de la LinkedList
    setDisplayList(visitList.toArray());
  }, [visitsFromRedux]);

  const fetchVisitors = async () => {
    dispatch(setLoading(true));
    console.log('[Redux] VisitorsScreen - solicitando visitas...');

    let query = supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile?.role === 'residente') {
      query = query.eq('user_id', user?.id);
    }

    const { data, error } = await query;

    if (error) {
      Alert.alert(t('error'), error.message);
    } else {
      dispatch(setVisits(data ?? []));
    }
    dispatch(setLoading(false));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setDisplayList(visitList.toArray());
    } else {
      const results = visitBST.search(text);
      setDisplayList(results);
    }
  };

  const handleSortAZ = () => {
    const sorted = visitBST.inOrder();
    setDisplayList(sorted);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VisitDetail', { visitId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>🪪 {item.id_number}</Text>
        <Text style={styles.meta}>🏠 Casa {item.house}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('visitors')}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('RegisterVisit')}>
          <Text style={styles.addBtnText}>{t('newVisitor')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar visitante por nombre..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.sortBtn} onPress={handleSortAZ}>
          <Text style={styles.sortBtnText}>AZ ↓</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{t('noVisits')}</Text>}
          onRefresh={fetchVisitors}
          refreshing={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  addBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 10 },
  searchInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#E2E8F0' },
  sortBtn: { backgroundColor: '#1E293B', borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  sortBtnText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  meta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  arrow: { fontSize: 22, color: '#94A3B8' },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 60, fontSize: 15 },
});

export default VisitorsScreen;