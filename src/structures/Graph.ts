import { HashTable } from './HashTable';
import { Queue } from './Queue';

/**
 * Implementación manual de un Grafo No Dirigido.
 * Utiliza una lista de adyacencia interna basada en una Tabla Hash manual.
 */
export class Graph {
  private adjacencyList: HashTable<string[]>;

  constructor() {
    this.adjacencyList = new HashTable<string[]>(20);
  }

  /**
   * Agrega un nuevo nodo (vértice) al grafo.
   * @param name Nombre del nodo.
   */
  addNode(name: string): void {
    if (!this.adjacencyList.get(name)) {
      this.adjacencyList.set(name, []);
    }
  }

  /**
   * Agrega una arista (conexión) entre dos nodos.
   * Al ser no dirigido, la conexión es bidireccional.
   * @param nodeA Primer nodo.
   * @param nodeB Segundo nodo.
   */
  addEdge(nodeA: string, nodeB: string): void {
    const neighborsA = this.adjacencyList.get(nodeA);
    const neighborsB = this.adjacencyList.get(nodeB);

    if (neighborsA && neighborsB) {
      if (!neighborsA.includes(nodeB)) neighborsA.push(nodeB);
      if (!neighborsB.includes(nodeA)) neighborsB.push(nodeA);
    }
  }

  /**
   * Búsqueda en Anchura (Breadth-First Search).
   * Explora los nodos nivel por nivel. Ideal para encontrar el camino más corto.
   * @param start Nodo inicial.
   * @returns Lista de nodos en el orden visitado.
   */
  bfs(start: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const queue = new Queue<string>();

    queue.enqueue(start);
    visited.add(start);

    while (!queue.isEmpty()) {
      const current = queue.dequeue()!;
      result.push(current);

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.enqueue(neighbor);
        }
      }
    }
    return result;
  }

  /**
   * Búsqueda en Profundidad (Depth-First Search).
   * Explora lo más lejos posible por cada rama antes de retroceder.
   * @param start Nodo inicial.
   * @returns Lista de nodos en el orden visitado.
   */
  dfs(start: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    this.dfsRecursive(start, visited, result);
    return result;
  }

  private dfsRecursive(node: string, visited: Set<string>, result: string[]): void {
    visited.add(node);
    result.push(node);

    const neighbors = this.adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.dfsRecursive(neighbor, visited, result);
      }
    }
  }

  /**
   * Encuentra el camino más corto entre dos nodos usando BFS.
   * @param start Nodo inicial.
   * @param end Nodo destino.
   * @returns Arreglo de nombres de nodos que forman el camino.
   */
  findPath(start: string, end: string): string[] {
    const queue = new Queue<string>();
    const visited = new Set<string>();
    const parent: { [key: string]: string | null } = {};

    queue.enqueue(start);
    visited.add(start);
    parent[start] = null;

    while (!queue.isEmpty()) {
      const current = queue.dequeue()!;
      if (current === end) {
        const path: string[] = [];
        let curr: string | null = end;
        while (curr !== null) {
          path.unshift(curr);
          curr = parent[curr] || null;
        }
        return path;
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent[neighbor] = current;
          queue.enqueue(neighbor);
        }
      }
    }
    return [];
  }

  /**
   * Retorna los vecinos de un nodo.
   * @param node Nombre del nodo.
   * @returns Arreglo de vecinos.
   */
  getNeighbors(node: string): string[] {
    return this.adjacencyList.get(node) || [];
  }

  /**
   * Retorna todos los nodos del grafo.
   * @returns Arreglo de nombres de nodos.
   */
  getAllNodes(): string[] {
    return this.adjacencyList.keys();
  }
}
