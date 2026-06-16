/**
 * Nodo para la estructura interna de la Cola.
 */
class QueueNode<T> {
  data: T;
  next: QueueNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

/**
 * Implementación manual de una Cola (Queue) Genérica.
 * Sigue el principio FIFO (First In, First Out) - El primero en entrar es el primero en salir.
 */
export class Queue<T> {
  private _front: QueueNode<T> | null = null;
  private _back: QueueNode<T> | null = null;
  private _size: number = 0;

  /**
   * Agrega un elemento al final de la cola.
   * @param item Elemento a agregar.
   */
  enqueue(item: T): void {
    const newNode = new QueueNode(item);
    if (this.isEmpty()) {
      this._front = newNode;
      this._back = newNode;
    } else {
      this._back!.next = newNode;
      this._back = newNode;
    }
    this._size++;
  }

  /**
   * Elimina y retorna el primer elemento de la cola.
   * @returns El primer elemento o null si está vacía.
   */
  dequeue(): T | null {
    if (this.isEmpty()) return null;
    const item = this._front!.data;
    this._front = this._front!.next;
    if (this._front === null) {
      this._back = null;
    }
    this._size--;
    return item;
  }

  /**
   * Retorna el primer elemento sin eliminarlo.
   * @returns El primer elemento o null si está vacía.
   */
  front(): T | null {
    if (this.isEmpty()) return null;
    return this._front!.data;
  }

  /**
   * Verifica si la cola está vacía.
   * @returns true si está vacía, false de lo contrario.
   */
  isEmpty(): boolean {
    return this._front === null;
  }

  /**
   * Retorna el número de elementos en la cola.
   * @returns Tamaño de la cola.
   */
  size(): number {
    return this._size;
  }

  /**
   * Convierte la cola en un arreglo (para visualización).
   * @returns Arreglo con los elementos de la cola.
   */
  toArray(): T[] {
    const result: T[] = [];
    let current = this._front;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }
}
