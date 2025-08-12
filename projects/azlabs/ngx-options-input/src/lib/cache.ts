/**  @interal disposable performs object cleanup */
type Disposable = {
  dispose(): void;
};

/**  @internal */
export type ValueResolver<TValue> = (value: TValue) => Promise<TValue> | TValue;

/** @description cache instance type definition */
export type CacheType<TKey, TValue> = {
  /** updated value at a given index */
  put(key: TKey, value: TValue, update?: ValueResolver<TValue>): void;

  /** return value at index `key` or undefined if value expired or does not exists */
  get(key: TKey): TValue | undefined;

  /** remove all items from cache */
  clear(): void;

  /** remove value at the given key in cache */
  delete(key: TKey): void;

  /** dispose the previous key removing it cleaning up any resource */
  dispose(key: TKey): void;
};

/** @intrenal cached value type definition */
type ValueType<TValue = unknown> = {
  value: () => TValue;
  refetch: () => void;
  expired: () => boolean;
  update: (value: TValue) => Promise<TValue>;
} & Disposable;

/** @internal key value pair instance of cached value */
type Pair<K, T> = [K, T];

/** @internal */
type EqualFn<T> = (a: T, b: T) => boolean;

/** @internal key value pair factory function */
function pair<TKey, TValue>(key: TKey, value?: TValue) {
  return [key, value] as Pair<TKey, TValue>;
}

/** @internal checks if a value is a Promise A+ instance */
function isPromise(p: unknown): p is Promise<unknown> {
  return (
    typeof p === 'object' && typeof (p as Promise<unknown>)?.then === 'function'
  );
}

/**
 * cached value factory function
 *
 * @param interval Number of seconds after which value is refresh
 * @param ttl number of seconds after which the cached item is not valid
 *
 */
function cached<TValue>(
  v: TValue,
  update?: ValueResolver<TValue>,
  interval?: number,
  ttl?: number
) {
  let x = v;
  const refetchTime = interval ?? -1;
  let timeout: ReturnType<typeof setInterval> | null = null;
  let expiresAt: Date | undefined;
  const fn = update ?? (() => Promise.resolve(x));

  // set the expiresAt variable value if ttl is provided
  function setExpiredDate(ttl: number | undefined) {
    if (ttl) {
      const t = new Date();
      const date = new Date();
      date.setSeconds(date.getSeconds() + ttl);
      expiresAt = date;
    }
  }

  // set the expiration date when item is cached
  setExpiredDate(ttl);
  const o = {
    value: () => x,
    refetch: () => {
      const result = fn(x);
      // case a promise is returned, we resolve the value from the then callback
      if (isPromise(result)) {
        result.then((resolved) => {
          x = resolved;

          // update the expiration date value
          setExpiredDate(ttl);
        });
      } else {
        // else the value is equals to the update value
        x = result as TValue;
        // update the expiration date value
        setExpiredDate(ttl);
      }
    },
    expired: () => {
      return expiresAt ? new Date().getTime() > expiresAt.getTime() : false;
    },
    update: fn,
  } as ValueType<TValue>;

  if (refetchTime !== -1 && refetchTime !== Infinity) {
    timeout = setInterval(() => {
      o.refetch();
    }, refetchTime * 1000);
  }

  Object.defineProperty(o, 'dispose', {
    value: () => {
      if (timeout !== null) {
        clearInterval(timeout);
      }
    },
  });

  return o;
}

/** @internal  cache instance default implementation */
export class Cache<TKey, TValue> implements CacheType<TKey, TValue> {
  // internal state for the cache
  private items: Pair<TKey, ValueType<TValue>>[] = [];
  private equals!: (a: TKey, b: TKey) => boolean;
  private interval: number;
  private ttl: number;

  /** creates a cache instance */
  public constructor(equals?: EqualFn<TKey>, interval?: number, ttl?: number) {
    this.equals = equals ?? ((a, b) => a === b);
    this.interval = interval ?? 60 * 60; // cached item will be refetched after each 1h by default
    this.ttl = ttl ?? 3600 - 1; // cached value will expire after 59min after it has been cached or updated
  }

  put(key: TKey, value: TValue, update?: ValueResolver<TValue>) {
    // remove the key if it already exists in cache
    this.delete(key);

    // then add the key in front of the existing items
    // to make search faster for new keys
    this.items = [
      pair(
        key,
        cached(
          value,
          update ? (x) => update(x) : undefined,
          update ? this.interval : undefined,
          update ? this.ttl : undefined
        )
      ),
      ...this.items,
    ];
  }

  private getCached(key: TKey): ValueType<TValue> | undefined {
    const index = this.items.findIndex(([k]) => this.equals(k, key));
    if (-1 === index) {
      return undefined;
    }

    const [, v] = this.items[index];
    if (v.expired()) {
      // first remove item from cache
      this.deleteAt(index);

      // we return undefined if the cached item has expired, at it means it does not exists
      // in cache therefore must be refetched manually
      return undefined;
    }
    return v;
  }

  dispose(key: TKey): void {
    this.getCached(key)?.dispose();
  }

  get(key: TKey) {
    // return the value either expired or not
    return this.getCached(key)?.value();
  }

  delete(key: TKey) {
    this.deleteAt(this.items.findIndex(([k]) => this.equals(k, key)));
  }

  public clear() {
    for (const [, value] of this.items) {
      value.dispose();
    }
    this.items = [];
  }

  public flush() {
    const keys = this.items.filter(([, v]) => v.expired()).map(([x]) => x);
    for (const key of keys) {
      this.delete(key);
    }
  }

  private deleteAt(index: number) {
    if (index === -1) {
      return;
    }

    const values = this.items.splice(index, 1);

    // when removing element from cache we call destroy method
    // in order to unsubscribe to any observable being run internally
    for (const [, value] of values) {
      value.dispose();
    }
  }
}
