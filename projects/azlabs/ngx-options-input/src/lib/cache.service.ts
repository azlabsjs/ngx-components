import { InputOptions } from '@azlabsjs/smart-form-core';
import { CacheType, _Cache } from './cache';

type KeyType = { [index: string]: unknown };

export class OptionsCache implements CacheType<KeyType, InputOptions> {
  // Properties
  private internal: CacheType<KeyType, InputOptions>;

  /** @description Options cache constructor */
  constructor(
    equals?: (a: KeyType, b: KeyType) => boolean,
    refreshInterval?: number,
    defaultTTL?: number
  ) {
    this.internal = new _Cache(equals, refreshInterval, defaultTTL);
  }

  put(
    key: KeyType,
    value: InputOptions,
    update?:
      | ((value: InputOptions) => InputOptions | Promise<InputOptions>)
      | undefined
  ): void {
    return this.internal.put(key, value, update);
  }

  get(key: KeyType): InputOptions | undefined {
    return this.internal.get(key);
  }

  delete(key: KeyType): void {
    return this.internal.delete(key);
  }
}
