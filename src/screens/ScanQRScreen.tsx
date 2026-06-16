import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, Image, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import CustomButton from '../components/CustomButton';
import { useAppDispatch } from '../store/hooks';
import { updateVisitStatus } from '../store/slices/visitSlice';
import { useNavigation } from '@react-navigation/native';
import { actionStack } from '../structures';

interface VisitData {
  id: string;
  name: string;
  house: string;
}

const ScanQRScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed: VisitData = JSON.parse(data);

      const { data: visit, error } = await supabase
        .from('visits')
        .select('*')
        .eq('id', parsed.id)
        .single();

      if (error || !visit) {
        Alert.alert('QR Inválido', 'No se encontró la visita en el sistema.', [
          { text: 'Escanear de nuevo', onPress: () => setScanned(false) }
        ]);
        return;
      }

      setVisitData(visit);
      setPhotoUri(null);
      setShowModal(true);
    } catch {
      Alert.alert('Error', 'El código QR no es válido.', [
        { text: 'Intentar de nuevo', onPress: () => setScanned(false) }
      ]);
    }
  };

  const takeIdPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesita permiso de cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      console.log('[Camera] Foto del DPI tomada');
    }
  };

  const uploadPhoto = async (uri: string, visitId: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${visitId}.jpg`;

      const { error } = await supabase.storage
        .from('visit-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true });

      if (error) {
        console.log('[Storage] Error subiendo foto:', error.message);
        return null;
      }

      const { data } = supabase.storage.from('visit-photos').getPublicUrl(fileName);
      console.log('[Storage] Foto subida:', data.publicUrl);
      return data.publicUrl;
    } catch (e) {
      console.log('[Storage] Error:', e);
      return null;
    }
  };

  const handleApprove = async () => {
    if (!visitData) return;

    if (!photoUri) {
      Alert.alert('Foto requerida', 'Debes tomar foto del ID antes de aprobar el acceso.');
      return;
    }

    setUploading(true);

    const prevStatus = (visitData as any).status;
    const photoUrl = await uploadPhoto(photoUri, visitData.id);
    if (photoUrl) {
      await supabase.from('visits').update({ photo_url: photoUrl }).eq('id', visitData.id);
    }

    await supabase.from('visits').update({ status: 'approved' }).eq('id', visitData.id);
    dispatch(updateVisitStatus({ id: visitData.id, status: 'approved' }));

    // Guardar acción en el Stack
    actionStack.push({
      visitId: visitData.id,
      previousStatus: prevStatus,
      newStatus: 'approved',
      timestamp: Date.now()
    });

    setUploading(false);

    Alert.alert('✅ Acceso Aprobado', `${visitData.name} puede ingresar a casa ${visitData.house}.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setShowModal(false);
    setScanned(false);
    setVisitData(null);
    setPhotoUri(null);
  };

  const handleDeny = async () => {
    if (!visitData) return;
    const prevStatus = (visitData as any).status;

    await supabase.from('visits').update({ status: 'denied' }).eq('id', visitData.id);
    dispatch(updateVisitStatus({ id: visitData.id, status: 'denied' }));

    // Guardar acción en el Stack
    actionStack.push({
      visitId: visitData.id,
      previousStatus: prevStatus,
      newStatus: 'denied',
      timestamp: Date.now()
    });

    Alert.alert('❌ Acceso Denegado', `Visita de ${visitData.name} denegada.`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    setShowModal(false);
    setScanned(false);
    setVisitData(null);
    setPhotoUri(null);
  };

  const handleUndo = async () => {
    const lastAction = actionStack.pop();
    if (!lastAction) {
      Alert.alert('Nada que deshacer', 'No hay acciones recientes para revertir.');
      return;
    }

    try {
      await supabase
        .from('visits')
        .update({ status: lastAction.previousStatus })
        .eq('id', lastAction.visitId);

      dispatch(updateVisitStatus({ id: lastAction.visitId, status: lastAction.previousStatus }));
      Alert.alert('↩ Acción Deshecha', `La visita ha vuelto a estado: ${lastAction.previousStatus}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo deshacer la acción.');
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>Se necesita acceso a la cámara para escanear QR.</Text>
        <CustomButton title="Conceder Permiso" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.undoBtn} onPress={handleUndo}>
        <Text style={styles.undoBtnText}>↩ Deshacer última acción</Text>
      </TouchableOpacity>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.hint}>Apunta al código QR del visitante</Text>
        </View>
      </CameraView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>👤 Visitante Detectado</Text>
            <Text style={styles.modalName}>{visitData?.name}</Text>
            <Text style={styles.modalMeta}>🏠 Casa {visitData?.house}</Text>

            {/* Foto del DPI */}
            <TouchableOpacity style={styles.photoBtn} onPress={takeIdPhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>🪪</Text>
                  <Text style={styles.photoText}>Tomar foto del ID (obligatorio)</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}>
                <CustomButton title="✅ Aprobar" onPress={handleApprove} loading={uploading} />
              </View>
              <View style={{ flex: 1 }}>
                <CustomButton title="❌ Denegar" onPress={handleDeny} variant="danger" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 220, height: 220, borderWidth: 3, borderColor: '#2563EB', borderRadius: 16, backgroundColor: 'transparent' },
  hint: { color: '#FFFFFF', marginTop: 20, fontSize: 14, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F1F5F9' },
  permText: { textAlign: 'center', color: '#475569', marginBottom: 16, fontSize: 15 },
  undoBtn: { position: 'absolute', top: 60, left: 24, right: 24, zIndex: 10, backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: 12, borderRadius: 12, alignItems: 'center' },
  undoBtnText: { color: '#FFF', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  modalName: { fontSize: 22, fontWeight: '800', color: '#2563EB' },
  modalMeta: { fontSize: 15, color: '#64748B', marginBottom: 16 },
  photoBtn: { marginBottom: 16 },
  photoPreview: { width: '100%', height: 160, borderRadius: 12 },
  photoPlaceholder: {
    width: '100%', height: 120, borderRadius: 12, borderWidth: 2,
    borderColor: '#CBD5E1', borderStyle: 'dashed', backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center',
  },
  photoIcon: { fontSize: 28, marginBottom: 6 },
  photoText: { fontSize: 13, color: '#94A3B8' },
  btnRow: { flexDirection: 'row', gap: 12 },
});

export default ScanQRScreen;