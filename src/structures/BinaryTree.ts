import { Visit } from '../store/slices/visitSlice';

/**
 * Nodo para el Árbol de Búsqueda Binaria.
 */
class TreeNode {
  data: Visit;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(data: Visit) {
    this.data = data;
  }
}

/**
 * Implementación manual de un Árbol de Búsqueda Binaria (BST).
 * Los nodos se ordenan alfabéticamente por el nombre del visitante.
 */
export class BinarySearchTree {
  private root: TreeNode | null = null;

  /**
   * Inserta una nueva visita en el árbol.
   * @param visit Objeto de visita a insertar.
   */
  insert(visit: Visit): void {
    const newNode = new TreeNode(visit);
    if (!this.root) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  private insertNode(node: TreeNode, newNode: TreeNode): void {
    if (newNode.data.name.toLowerCase() < node.data.name.toLowerCase()) {
      if (!node.left) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (!node.right) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  /**
   * Busca visitas por nombre (coincidencia parcial).
   * @param name Nombre a buscar.
   * @returns Arreglo de visitas encontradas.
   */
  search(name: string): Visit[] {
    const result: Visit[] = [];
    this.searchNode(this.root, name.toLowerCase(), result);
    return result;
  }

  private searchNode(node: TreeNode | null, name: string, result: Visit[]): void {
    if (!node) return;
    if (node.data.name.toLowerCase().includes(name)) {
      result.push(node.data);
    }
    this.searchNode(node.left, name, result);
    this.searchNode(node.right, name, result);
  }

  /**
   * Recorrido In-Order (Izquierda, Raíz, Derecha).
   * Resulta en una lista ordenada alfabéticamente.
   * @returns Arreglo de visitas ordenadas.
   */
  inOrder(): Visit[] {
    const result: Visit[] = [];
    this.inOrderTraversal(this.root, result);
    return result;
  }

  private inOrderTraversal(node: TreeNode | null, result: Visit[]): void {
    if (node) {
      this.inOrderTraversal(node.left, result);
      result.push(node.data);
      this.inOrderTraversal(node.right, result);
    }
  }

  /**
   * Recorrido Pre-Order (Raíz, Izquierda, Derecha).
   * @returns Arreglo de visitas.
   */
  preOrder(): Visit[] {
    const result: Visit[] = [];
    this.preOrderTraversal(this.root, result);
    return result;
  }

  private preOrderTraversal(node: TreeNode | null, result: Visit[]): void {
    if (node) {
      result.push(node.data);
      this.preOrderTraversal(node.left, result);
      this.preOrderTraversal(node.right, result);
    }
  }

  /**
   * Recorrido Post-Order (Izquierda, Derecha, Raíz).
   * @returns Arreglo de visitas.
   */
  postOrder(): Visit[] {
    const result: Visit[] = [];
    this.postOrderTraversal(this.root, result);
    return result;
  }

  private postOrderTraversal(node: TreeNode | null, result: Visit[]): void {
    if (node) {
      this.postOrderTraversal(node.left, result);
      this.postOrderTraversal(node.right, result);
      result.push(node.data);
    }
  }

  /**
   * Limpia el árbol.
   */
  clear(): void {
    this.root = null;
  }
}
