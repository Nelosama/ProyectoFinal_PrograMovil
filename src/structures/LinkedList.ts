/**
 * Nodo para la lista doblemente enlazada.
 */
class LinkedListNode<T> {
  data: T;
  next: LinkedListNode<T> | null = null;
  prev: LinkedListNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

/**
 * Implementación manual de una Lista Doblemente Enlazada Genérica.
 */
export class LinkedList<T> {
  private head: LinkedListNode<T> | null = null;
  private tail: LinkedListNode<T> | null = null;
  private _size: number = 0;

  /**
   * Inserta un nuevo elemento al final de la lista.
   * @param data Datos a insertar.
   */
  insert(data: T): void {
    const newNode = new LinkedListNode(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.prev = this.tail;
        this.tail = newNode;
      }
    }
    this._size++;
  }

  /**
   * Elimina un elemento de la lista por su ID.
   * Asume que T tiene una propiedad 'id'.
   * @param id Identificador del elemento a eliminar.
   */
  delete(id: string): void {
    let current = this.head;
    while (current) {
      if ((current.data as any).id === id) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }

        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }

        this._size--;
        return;
      }
      current = current.next;
    }
  }

  /**
   * Busca un elemento en la lista por su ID.
   * @param id Identificador del elemento.
   * @returns El dato encontrado o null si no existe.
   */
  search(id: string): T | null {
    let current = this.head;
    while (current) {
      if ((current.data as any).id === id) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Convierte la lista en un arreglo de JavaScript.
   * @returns Arreglo con los datos de la lista.
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Retorna el tamaño actual de la lista.
   * @returns Número de elementos.
   */
  size(): number {
    return this._size;
  }
}
