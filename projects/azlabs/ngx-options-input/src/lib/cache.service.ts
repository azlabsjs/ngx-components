import { InputOptions } from '@azlabsjs/smart-form-core';
import { CacheType, _Cache } from './cache';

/** @internal */
type KeyType = { [index: string]: unknown };

export class OptionsCache implements CacheType<KeyType, InputOptions> {
  //#region properties
  private cache: CacheType<KeyType, InputOptions>;
  //#endregion

  /** @description Options cache constructor */
  constructor(
    equals?: (a: KeyType, b: KeyType) => boolean,
    refreshInterval?: number,
    defaultTTL?: number
  ) {
    this.cache = new _Cache(equals, refreshInterval, defaultTTL);
  }

  put(
    key: KeyType,
    value: InputOptions,
    update?:
      | ((value: InputOptions) => InputOptions | Promise<InputOptions>)
      | undefined
  ): void {
    return this.cache.put(key, value, update);
  }

  get(key: KeyType): InputOptions | undefined {
    return this.cache.get(key);
  }

  delete(key: KeyType): void {
    return this.cache.delete(key);
  }
}
