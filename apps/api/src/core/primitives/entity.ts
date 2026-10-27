export abstract class Entity<Props extends object> {
  readonly #id: string;
  readonly #props: Props;

  protected constructor(props: Props, id: string) {
    this.#id = id;
    this.#props = props;
  }

  get id() {
    return this.#id;
  }

  /** Live props, mutable by the entity itself. External readers get `getProps()`. */
  protected get props() {
    return this.#props;
  }

  getProps(): Readonly<Props> {
    return Object.freeze({ ...this.#props });
  }

  equals(other?: Entity<Props>) {
    if (!other) {
      return false;
    }

    return other.constructor === this.constructor && other.id === this.id;
  }
}
