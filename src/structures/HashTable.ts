/**
 * Nodo para el encadenamiento separado en la Tabla Hash.
 */
class HashNode<K, V> {
  key: K;
  value: V;
  next: HashNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * Implementación manual de una Tabla Hash (HashTable).
 * Utiliza encadenamiento separado para el manejo de colisiones.
 * Cada cubeta (bucket) es una lista enlazada simple de pares [clave, valor].
 */
export class HashTable<V> {
  private buckets: (HashNode<string, V> | null)[];
  private size: number;

  constructor(size: number = 53) {
    this.size = size;
    this.buckets = new Array(size).fill(null);
  }

  /**
   * Algoritmo de hash djb2.
   * Convierte una cadena de texto en un índice numérico para la tabla.
   * @param key Clave a hashear.
   * @returns Índice en la tabla.
   */
  private hash(key: string): number {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 33) ^ key.charCodeAt(i);
    }
    return Math.abs(hash) % this.size;
  }

  /**
   * Inserta o actualiza un valor en la tabla.
   * Si hay una colisión, se agrega al inicio de la lista enlazada en esa cubeta.
   * @param key Clave.
   * @param value Valor.
   */
  set(key: string, value: V): void {
    const index = this.hash(key);
    let current = this.buckets[index];

    // Buscar si la clave ya existe para actualizarla
    while (current) {
      if (current.key === key) {
        current.value = value;
        return;
      }
      current = current.next;
    }

    // Si no existe, crear nuevo nodo e insertar al inicio (encadenamiento)
    const newNode = new HashNode(key, value);
    newNode.next = this.buckets[index];
    this.buckets[index] = newNode;
  }

  /**
   * Obtiene un valor de la tabla por su clave.
   * @param key Clave a buscar.
   * @returns El valor encontrado o undefined si no existe.
   */
  get(key: string): V | undefined {
    const index = this.hash(key);
    let current = this.buckets[index];

    while (current) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  /**
   * Elimina un elemento de la tabla.
   * @param key Clave a eliminar.
   * @returns true si se eliminó, false si no se encontró.
   */
  delete(key: string): boolean {
    const index = this.hash(key);
    let current = this.buckets[index];
    let prev: HashNode<string, V> | null = null;

    while (current) {
      if (current.key === key) {
        if (prev) {
          prev.next = current.next;
        } else {
          this.buckets[index] = current.next;
        }
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  /**
   * Retorna todas las claves almacenadas en la tabla.
   * @returns Arreglo de claves.
   */
  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.size; i++) {
      let current = this.buckets[i];
      while (current) {
        keys.push(current.key);
        current = current.next;
      }
    }
    return keys;
  }
}
