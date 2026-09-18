/**  @interal disposable performs object cleanup */
type Disposable = {
  dispose(): void;
};

type Observer<T> = { next: (value: T) => void }
type Observable<T> = { subscribe: (observer: Observer<T>) => void };

/**  @internal */
export type ValueResolver<TValue> = () => Promise<TValue> | TValue;

/** @description cache instance type definition */
export type CacheType<TKey, TValue> = {
  /** updated value at a given index */
  put(key: TKey, value: TValue | ValueResolver<TValue>, subscriber?: Observer<TValue>): void;

  /** return value at index `key` or undefined if value expired or does not exists */
  get(key: TKey): (ValueType<TValue> & Observable<TValue>) | undefined;

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
  // update: (value: TValue) => Promise<TValue>;
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
 * @param time number of seconds after which the cached item is not valid
 *
 */
function cached<TValue>(fn: ValueResolver<TValue>, subscriber?: { next: (value: TValue) => unknown }, interval?: number, time?: number) {
  const refetchTime = interval ?? -1;
  let timeout: ReturnType<typeof setInterval> | null = null;
  let expiresAt: Date | undefined;
  let state: TValue | null = null;
  let subscribers: Set<{ next: (value: TValue) => unknown }> | null = new Set([]);

  if (subscriber) {
    subscribers.add(subscriber);
  }

  function setExpiredDate(t: number | undefined) {
    if (t) {
      const date = new Date();
      date.setSeconds(date.getSeconds() + t);
      expiresAt = date;
    }
  }

  function notify(value: TValue) {
    if (!subscribers) {
      return;
    }

    for (const subscriber of subscribers) {
      subscriber.next(value);
    }
  }

  function fetch() {
    const result = fn();
    if (!isPromise(result)) {
      state = result;
      notify(state);
      setExpiredDate(time);
      return;
    }

    result.then((resolved) => {
      state = resolved;
      notify(state);
      setExpiredDate(time);
    });
  }

  setExpiredDate(time);
  const cache = {
    value: () => state,
    refetch: () => fetch(),
    expired: () => expiresAt ? new Date().getTime() > expiresAt.getTime() : false,
    subscribe: (observer) => {
      if (subscribers) {
        subscribers.add(observer);
      }
    },
    dispose() {
      state = null;
      subscribers = null;
      if (timeout) {
        clearInterval(timeout);
      }
    },
  } as ValueType<TValue> & Observable<TValue>;

  if (refetchTime < 0 && refetchTime !== Infinity) {
    timeout = setInterval(() => {
      cache.refetch();
    }, refetchTime * 1000);
  }

  fetch();

  return cache;
}

/** @internal  cache instance default implementation */
export class Cache<TKey, TValue> implements CacheType<TKey, TValue> {
  private items: Pair<TKey, ValueType<TValue> & Observable<TValue>>[] = [];
  private equals!: (a: TKey, b: TKey) => boolean;
  private interval: number;
  private time: number;

  /** creates a cache instance */
  public constructor(equals?: EqualFn<TKey>, interval?: number, ttl?: number) {
    this.equals = equals ?? ((a, b) => a === b);
    this.interval = interval ?? 60 * 60; // cached item will be refetched after each 1h by default
    this.time = ttl ?? 3600 - 1; // cached value will expire after 59min after it has been cached or updated
  }

  put(key: TKey, value: TValue | ValueResolver<TValue>, subscriber?: Observer<TValue>) {
    this.delete(key);
    const isFn = typeof value === 'function';
    this.items = [
      pair(key, cached(isFn ? value as ValueResolver<TValue> : () => value as TValue, subscriber, isFn ? this.interval : undefined, isFn ? this.time : undefined)),
      ...this.items,
    ];
  }

  private getCached(key: TKey) {
    const index = this.items.findIndex(([k]) => this.equals(k, key));
    if (-1 === index) {
      return undefined;
    }

    const [, v] = this.items[index];
    if (v.expired()) {
      this.deleteAt(index);
      return undefined;
    }

    return v;
  }

  dispose(key: TKey): void {
    this.getCached(key)?.dispose();
  }

  get(key: TKey) {
    return this.getCached(key);
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
