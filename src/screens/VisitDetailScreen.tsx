import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/StackNavigator';
import { supabase } from '../lib/supabase';
import CustomButton from '../components/CustomButton';
import { visitList } from '../structures';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { updateVisitStatus } from '../store/slices/visitSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'VisitDetail'>;

interface Visit {
  id: string;
  name: string;
  id_number: string;
  house: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_out';
  created_at: string;
}

const VisitDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { visitId } = route.params;
  const { profile } = useAuth();
  const dispatch = useAppDispatch();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVisit();
  }, []);

  const fetchVisit = async () => {
    const { data, error } = await supabase.from('visits').select('*').eq('id', visitId).single();
    if (error) Alert.alert('Error', error.message);
    else setVisit(data);
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!visit) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('visits')
        .update({ status: 'checked_out' })
        .eq('id', visitId);

      if (error) throw error;

      dispatch(updateVisitStatus({ id: visitId, status: 'checked_out' }));
      setVisit({ ...visit, status: 'checked_out' });
      Alert.alert('Salida Registrada', `Se ha registrado la salida de ${visit.name}.`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar esta visita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await supabase.from('visits').delete().eq('id', visitId);
          visitList.delete(visitId);
          console.log('[Estructuras] Visita eliminada de LinkedList:', visitId);
          navigation.goBack();
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2563EB" />;
  if (!visit) return null;

  const qrData = JSON.stringify({ id: visit.id, name: visit.name, house: visit.house });
  const statusColor =
    visit.status === 'approved' ? '#16A34A' :
    visit.status === 'denied' ? '#DC2626' :
    visit.status === 'checked_out' ? '#2563EB' : '#D97706';

  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        <QRCode value={qrData} size={160} />
      </View>

      <View style={styles.card}>
        <Row label="Nombre" value={visit.name} />
        <Row label="DPI" value={visit.id_number} />
        <Row label="Casa" value={`Casa ${visit.house}`} />
        {visit.reason ? <Row label="Motivo" value={visit.reason} /> : null}
        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <Text style={[styles.value, { color: statusColor, fontWeight: '700' }]}>
            {visit.status === 'approved' ? '✅ Aprobado' :
             visit.status === 'denied' ? '❌ Denegado' :
             visit.status === 'checked_out' ? '🔵 Salida' : '⏳ Pendiente'}
          </Text>
        </View>
      </View>

      {(profile?.role === 'guardia' || profile?.role === 'admin') && visit.status === 'approved' && (
        <CustomButton
          title="🚪 Registrar Salida"
          onPress={handleCheckOut}
          loading={actionLoading}
          variant="primary"
          style={{ marginBottom: 12 }}
        />
      )}

      <CustomButton title="🗑 Eliminar Visita" onPress={handleDelete} variant="danger" />
    </View>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 24 },
  qrBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  label: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  value: { fontSize: 14, color: '#1E293B', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
});

export default VisitDetailScreen;
