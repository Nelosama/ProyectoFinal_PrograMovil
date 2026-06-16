import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { residentialGraph } from '../structures';

const GraphScreen = () => {
  const insets = useSafeAreaInsets();
  const allNodes = residentialGraph.getAllNodes();
  const [selectedNode, setSelectedNode] = useState<string | null>("Entrada");

  const neighbors = selectedNode ? residentialGraph.getNeighbors(selectedNode) : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa Residencial (Grafo)</Text>
        <Text style={styles.subtitle}>Estructura de conexiones del complejo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Nodos del Sistema</Text>
        <View style={styles.nodesGrid}>
          {allNodes.map(node => (
            <TouchableOpacity
              key={node}
              style={[styles.nodeChip, selectedNode === node && styles.selectedNode]}
              onPress={() => setSelectedNode(node)}
            >
              <Text style={[styles.nodeText, selectedNode === node && styles.selectedNodeText]}>
                {node}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedNode && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Conexiones de: {selectedNode}</Text>
            <View style={styles.neighborsList}>
              {neighbors.length > 0 ? neighbors.map(neighbor => (
                <View key={neighbor} style={styles.neighborItem}>
                  <Text style={styles.neighborBullet}>•</Text>
                  <Text style={styles.neighborText}>{neighbor}</Text>
                </View>
              )) : (
                <Text style={styles.noNeighbors}>Sin conexiones directas</Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>¿Qué es BFS vs DFS?</Text>
              <Text style={styles.infoText}>
                <Text style={{fontWeight: '700'}}>BFS (Anchura):</Text> Explora nivel por nivel. Es el que usamos para calcular la "Ruta" en el Home porque garantiza el camino más corto.
              </Text>
              <Text style={[styles.infoText, {marginTop: 8}]}>
                <Text style={{fontWeight: '700'}}>DFS (Profundidad):</Text> Explora una rama lo más profundo posible antes de retroceder. Útil para recorrer todo el grafo o detectar ciclos.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 16 },
  nodesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  nodeChip: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  selectedNode: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  nodeText: { color: '#475569', fontWeight: '500', fontSize: 14 },
  selectedNodeText: { color: '#FFF' },
  detailCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  neighborsList: { marginBottom: 20 },
  neighborItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  neighborBullet: { color: '#2563EB', fontSize: 20, fontWeight: '700', marginRight: 10 },
  neighborText: { color: '#334155', fontSize: 15, fontWeight: '500' },
  noNeighbors: { color: '#94A3B8', fontStyle: 'italic' },
  infoBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#2563EB' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#64748B', lineHeight: 18 },
});

export default GraphScreen;
