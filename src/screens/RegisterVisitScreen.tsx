import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as FS from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store/hooks';
import { addVisit } from '../store/slices/visitSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { visitList, visitQueue } from '../structures';

const RegisterVisitScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [house, setHouse] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [sharing, setSharing] = useState(false);
  const svgRef = useRef<any>(null);
  const { user } = useAuth();

  const handleRegister = async () => {
    if (!name || !idNumber || !house) {
      Alert.alert(t('error'), 'Nombre, DPI y Casa son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      console.log('[Redux] RegisterVisitScreen - registrando nueva visita:', name);

      const { data, error } = await supabase
      .from('visits')
      .insert([{ name, id_number: idNumber, house, status: 'pending', user_id: user?.id }])
      .select()
      .single();

      if (error) throw error;

      dispatch(addVisit(data));
      console.log('[Redux] RegisterVisitScreen - visita agregada al estado global:', data.id);

      // Integración con Estructuras Manuales
      visitList.insert(data);
      visitQueue.enqueue(data);
      console.log('[Estructuras] Visita insertada en LinkedList y encolada en Queue');

      const qrData = JSON.stringify({ id: data.id, name: data.name, house: data.house });
      setQrValue(qrData);
      setShowQR(true);
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
  try {
    setSharing(true);

    svgRef.current?.toDataURL(async (data: string) => {
      try {
        const legacy = require('expo-file-system/legacy');
        const cacheDir = legacy.cacheDirectory;
        console.log('[Share] cacheDirectory:', cacheDir);
        
        const fileUri = cacheDir + 'qr_visita.png';
        
        await legacy.writeAsStringAsync(fileUri, data, {
          encoding: legacy.EncodingType.Base64,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: `QR de acceso para ${name}`,
          });
        } else {
          Alert.alert('Error', 'Compartir no está disponible en este dispositivo.');
        }
      } catch (e) {
        console.log('[Share] Error interno:', e);
      }
      setSharing(false);
    });
  } catch (e) {
    console.log('[Share] Error:', e);
    setSharing(false);
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>{t('completeData')}</Text>

      <CustomInput label={t('fullName')} placeholder="Juan Pérez" value={name} onChangeText={setName} />
      <CustomInput label={t('idNumber')} placeholder="0000 00000 0000" value={idNumber} onChangeText={setIdNumber} keyboardType="numeric" />
      <CustomInput label={t('house')} placeholder="Ej: B-12" value={house} onChangeText={setHouse} autoCapitalize="characters" />

      <CustomButton title={t('registerAndQR')} onPress={handleRegister} loading={loading} />

      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('visitRegistered')}</Text>
            <Text style={styles.modalSub}>{t('qrAccess')} {name}</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={qrValue}
                size={200}
                getRef={(ref) => (svgRef.current = ref)}
              />
            </View>
            <CustomButton
              title="📤 Compartir QR"
              onPress={handleShare}
              loading={sharing}
              variant="secondary"
            />
            <CustomButton
              title={t('done')}
              onPress={() => { setShowQR(false); navigation.goBack(); }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { padding: 24 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  modalSub: { fontSize: 14, color: '#64748B', marginBottom: 24, textAlign: 'center' },
  qrBox: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 16 },
});

export default RegisterVisitScreen;