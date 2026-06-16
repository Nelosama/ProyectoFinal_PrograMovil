import { LinkedList } from './LinkedList';
import { Stack } from './Stack';
import { Queue } from './Queue';
import { BinarySearchTree } from './BinaryTree';
import { HashTable } from './HashTable';
import { Graph } from './Graph';
import { Visit } from '../store/slices/visitSlice';

// Tipos para los registros de acciones (Stack)
export interface ActionRecord {
  visitId: string;
  previousStatus: 'pending' | 'approved' | 'denied';
  newStatus: 'pending' | 'approved' | 'denied';
  timestamp: number;
}

// Perfil de usuario (para la cache)
export interface Profile {
  id: string;
  email: string;
  role: 'residente' | 'guardia' | 'admin';
  house: string | null;
  full_name: string | null;
}

// Exportación de instancias únicas (Singletons)
export const visitList = new LinkedList<Visit>();
export const actionStack = new Stack<ActionRecord>();
export const visitQueue = new Queue<Visit>();
export const visitBST = new BinarySearchTree();
export const profileCache = new HashTable<Profile>(53);
export const residentialGraph = new Graph();

// Inicialización del grafo residencial con la distribución especificada
const initGraph = () => {
  const nodes = ["Entrada", "Caseta", "Zona-A", "Zona-B", "A-1", "A-2", "A-3", "B-1", "B-2", "B-3"];
  nodes.forEach(node => residentialGraph.addNode(node));

  const edges: [string, string][] = [
    ["Entrada", "Caseta"],
    ["Caseta", "Zona-A"],
    ["Caseta", "Zona-B"],
    ["Zona-A", "A-1"],
    ["Zona-A", "A-2"],
    ["Zona-A", "A-3"],
    ["Zona-B", "B-1"],
    ["Zona-B", "B-2"],
    ["Zona-B", "B-3"]
  ];

  edges.forEach(([a, b]) => residentialGraph.addEdge(a, b));
};

initGraph();
