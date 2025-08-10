import { Injector, Provider, inject } from '@angular/core';
import { optionsQueryClient } from './helpers';
import { INPUT_OPTIONS_CLIENT, OPTIONS_CACHE } from './tokens';
import { OptionsQueryConfigType } from './types';
import { deepEqual } from '@azlabsjs/utilities';
import { InputOptions } from '@azlabsjs/smart-form-core';
import { CacheType, Cache } from './cache';

/** @internal */
type KeyType = { [index: string]: unknown };

/** @internal */
type EqualFn = (a: KeyType, b: KeyType) => boolean;

function createCache(equals?: EqualFn, interval?: number, ttl?: number) {
  let cache = new Cache<KeyType, InputOptions>(equals, interval, ttl);
  return {
    put: (key, value, update?) => {
      return cache.put(key, value, update);
    },

    get: (key) => {
      return cache.get(key);
    },

    delete: (key) => {
      cache.delete(key);
    },
  } as CacheType<KeyType, InputOptions>;
}

/** provides client that is internally used to query server side options */
export function provideQueryClient(
  config: OptionsQueryConfigType,
  host?: string
) {
  return {
    provide: INPUT_OPTIONS_CLIENT,
    useFactory: () => {
      return optionsQueryClient(inject(Injector), host, config);
    },
  } as Provider;
}

/** provides caching configuration for loaded options */
export function provideCacheConfig(ttl?: number, refetchInterval?: number) {
  return {
    provide: OPTIONS_CACHE,
    useFactory: () => {
      return createCache(deepEqual, refetchInterval, ttl);
    },
  };
}
