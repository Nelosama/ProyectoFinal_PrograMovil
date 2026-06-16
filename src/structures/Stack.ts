/**
 * Nodo para la estructura interna del Stack.
 */
class StackNode<T> {
  data: T;
  next: StackNode<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

/**
 * Implementación manual de una Pila (Stack) Genérica.
 * Sigue el principio LIFO (Last In, First Out) - El último en entrar es el primero en salir.
 */
export class Stack<T> {
  private top: StackNode<T> | null = null;
  private _size: number = 0;

  /**
   * Agrega un elemento a la cima de la pila.
   * @param item Elemento a agregar.
   */
  push(item: T): void {
    const newNode = new StackNode(item);
    newNode.next = this.top;
    this.top = newNode;
    this._size++;
  }

  /**
   * Elimina y retorna el elemento en la cima de la pila.
   * @returns El elemento de la cima o null si está vacía.
   */
  pop(): T | null {
    if (this.isEmpty()) return null;
    const item = this.top!.data;
    this.top = this.top!.next;
    this._size--;
    return item;
  }

  /**
   * Retorna el elemento en la cima sin eliminarlo.
   * @returns El elemento de la cima o null si está vacía.
   */
  peek(): T | null {
    if (this.isEmpty()) return null;
    return this.top!.data;
  }

  /**
   * Verifica si la pila está vacía.
   * @returns true si está vacía, false de lo contrario.
   */
  isEmpty(): boolean {
    return this.top === null;
  }

  /**
   * Retorna el número de elementos en la pila.
   * @returns Tamaño de la pila.
   */
  size(): number {
    return this._size;
  }
}
