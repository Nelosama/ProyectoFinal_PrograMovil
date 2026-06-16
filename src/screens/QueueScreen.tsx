import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { visitQueue } from '../structures';
import { Visit } from '../store/slices/visitSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QueueScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [queueData, setQueueData] = useState<Visit[]>([]);

  useEffect(() => {
    updateQueue();
  }, []);

  const updateQueue = () => {
    setQueueData(visitQueue.toArray());
  };

  const handleAttendNext = () => {
    const nextVisit = visitQueue.dequeue();
    if (!nextVisit) {
      Alert.alert('Cola vacía', 'No hay más visitas pendientes en la cola.');
      return;
    }
    updateQueue();
    // Abrir detalle para aprobación
    navigation.navigate('VisitDetail', { visitId: nextVisit.id });
  };

  const renderItem = ({ item, index }: { item: Visit, index: number }) => (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{index + 1}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>🏠 Casa {item.house}</Text>
      </View>
      <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Cola de Entrada (FIFO)</Text>
        <Text style={styles.subtitle}>Las visitas aparecen en orden de registro</Text>
      </View>

      <FlatList
        data={queueData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>😴</Text>
            <Text style={styles.emptyText}>No hay nadie en la cola</Text>
          </View>
        }
        onRefresh={updateQueue}
        refreshing={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.attendBtn} onPress={handleAttendNext}>
          <Text style={styles.attendBtnText}>Atender Siguiente ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  meta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  time: { fontSize: 12, color: '#94A3B8' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },
  footer: { padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  attendBtn: { backgroundColor: '#2563EB', borderRadius: 12, padding: 16, alignItems: 'center' },
  attendBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

export default QueueScreen;
