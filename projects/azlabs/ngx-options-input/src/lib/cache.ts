/**
 * @interal Disposable performs object cleanup
 */
type Disposable = {
  dispose(): void;
};

/**
 * @internal
 */
type ValueResolver<TValue> = (value: TValue) => Promise<TValue> | TValue;

/**
 * Cache instance type definition
 */
export type CacheType<TKey, TValue> = {
  put(key: TKey, value: TValue, update?: ValueResolver<TValue>): void;
  get(key: TKey): TValue | undefined;
  delete(key: TKey): void;
};

/**
 * @intrenal Cached value type definition
 */
type ValueType<TValue = unknown> = {
  getValue: () => TValue;
  refresh: () => void;
  expired: () => boolean;
  update: (value: TValue) => Promise<TValue>;
} & Disposable;

/**
 * @internal Key value pair instance of cached value
 */
type Pair<K, T> = {
  key: () => K;
  getValue: () => T;
};

/**
 * @internal Key value pair factory function
 */
function createPair<TKey, TValue>(key: TKey, value?: TValue) {
  return {
    key: () => key,
    getValue: () => value,
  } as Pair<TKey, TValue>;
}

/**
 * @internal
 *
 * Checks if a value is a Promise A+ instance
 */
function isPromise(p: unknown): p is Promise<unknown> {
  if (
    typeof p === 'object' &&
    typeof (p as Promise<unknown>)?.then === 'function'
  ) {
    return true;
  }

  return false;
}

/**
 * Cached value factory function
 *
 * @param interval Number of seconds after which value is refresh
 * @param ttl number of seconds after which the cached item is not valid
 *
 */
function createCachedValue<TValue>(
  value: TValue,
  update?: (value: TValue) => Promise<TValue> | TValue,
  interval?: number,
  ttl?: number
) {
  let _value = value;
  const _interval = interval ?? -1;
  let _intervalId: ReturnType<typeof setInterval> | null = null;
  let expiresAt: Date | undefined;
  const _update = update ?? (() => Promise.resolve(_value));

  // Set the expiresAt variable value if ttl is provided
  if (ttl) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + ttl);
    expiresAt = date;
  }

  const object$ = {
    getValue: () => _value,
    refresh: () => {
      const result = _update(_value);
      // Case a promise is returned, we resolve the value from the then callback
      if (isPromise(result)) {
        result.then((resolved) => (_value = resolved));
      }
      // else the value is equals to the update value
      _value = result as TValue;
    },
    expired: () => {
      if (expiresAt) {
        return new Date().getTime() > expiresAt.getTime();
      }
      return false;
    },
    update: _update,
  } as ValueType<TValue>;

  if (_interval !== -1 && _interval !== Infinity) {
    _intervalId = setInterval(() => {
      object$.refresh();
    }, _interval * 1000);
  }

  Object.defineProperty(object$, 'dispose', {
    value: () => {
      if (_intervalId !== null) {
        clearInterval(_intervalId);
      }
    },
  });

  return object$;
}

/**
 * @internal
 *
 * Cache instance default implementation
 */
export class _Cache<TKey, TValue> implements CacheType<TKey, TValue> {
  // Internal state for the cache
  private items: Pair<TKey, ValueType<TValue>>[] = [];
  private equals!: (a: TKey, b: TKey) => boolean;
  private refreshInterval: number;
  private defaultTTL: number;

  /**
   * Creates a cache instance
   * 
   * @param equals 
   * @param refreshInterval 
   * @param defaultTTL 
   */
  public constructor(
    equals?: (a: TKey, b: TKey) => boolean,
    refreshInterval?: number,
    defaultTTL?: number
  ) {
    this.equals = equals ?? ((a, b) => a === b);
    this.refreshInterval = refreshInterval ?? 60 * 60;
    this.defaultTTL = defaultTTL ?? 60 * 60 + 60 * 5;
  }

  put(key: TKey, value: TValue, update?: ValueResolver<TValue>) {
    this.items = [
      createPair(
        key,
        createCachedValue(
          value,
          update
            ? (_value) => {
                return update(_value);
              }
            : undefined,
          update ? this.refreshInterval : undefined,
          update ? this.defaultTTL : undefined
        )
      ),
    ].concat(...this.items);
  }

  get(key: TKey) {
    const index = this.items.findIndex((item) => this.equals(item.key(), key));
    if (-1 === index) {
      return undefined;
    }
    const value = this.items[index].getValue();
    if (value.expired()) {
      // First remove item from cache
      this.deleteAt(index);

      // We return undefined if the cached item has expired, at it means it does not exists
      // in cache therefore must be refetched manually
      return undefined;
    }
    // Return the value either expired or not
    return value.getValue();
  }

  delete(key: TKey) {
    this.deleteAt(this.items.findIndex((item) => this.equals(item.key(), key)));
  }

  public clear() {
    for (const item of this.items) {
      this.delete(item.key());
    }
  }

  public flush() {
    for (const item of this.items) {
      if (item.getValue().expired()) {
        this.delete(item.key());
      }
    }
  }

  private deleteAt(index: number) {
    if (index === -1) {
      return;
    }
    const _items = [...this.items];
    const values = _items.splice(index, 1);
    // When removing element from cache we call destroy method
    // in order to unsubscribe to any observable being run internally
    for (const item of values) {
      item.getValue().dispose();
    }
    this.items = _items;
  }
}
