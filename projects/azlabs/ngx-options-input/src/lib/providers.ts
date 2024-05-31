import { Injector, Provider, inject } from '@angular/core';
import { optionsQueryClient } from './helpers';
import { INPUT_OPTIONS_CLIENT, OPTIONS_CACHE } from './tokens';
import { OptionsQueryConfigType } from './types';
import { OptionsCache } from './cache.service';
import { deepEqual } from '@azlabsjs/utilities';

/** @description Provides client that is internally used to query server side options */
export function provideQueryClient(
  queryConfig: OptionsQueryConfigType,
  host?: string
) {
  return {
    provide: INPUT_OPTIONS_CLIENT,
    useFactory: () => {
      return optionsQueryClient(inject(Injector), host, queryConfig);
    },
  } as Provider;
}

/** @description Provides caching configuration for loaded options */
export function provideCacheConfig(ttl?: number, refetchInterval?: number) {
  return {
    provide: OPTIONS_CACHE,
    useFactory: () => {
      return new OptionsCache(deepEqual, refetchInterval, ttl);
    },
  };
}
