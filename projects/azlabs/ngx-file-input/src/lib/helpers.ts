import { EventArgType } from './types';

/**
 * @description UUID version 4 string generator
 *
 * @internal
 */
export function uuidv4() {
  const rand = Math.random;
  function substr(str: string, offset: number, length: number) {
    return str.substring(offset, Math.min(str.length, offset + length));
  }
  let nbr: number;
  let randStr = '';
  do {
    randStr += substr((nbr = rand()).toString(16), 3, 6);
  } while (randStr.length < 30);
  return `${substr(randStr, 0, 8)}-${substr(randStr, 8, 4)}-${substr(
    randStr,
    12,
    3
  )}-${(((nbr * 4) | 0) + 8).toString(16) + substr(randStr, 15, 3)}-${substr(
    randStr,
    18,
    12
  )}`;
}

/** @description Try to parse an HTTP url to check wether the resource URI is valid or not */
export function isValidHttpUrl(uri: string) {
  try {
    const url = new URL(uri);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/** @description Get object id property value if read equals `id` and entire object, case the read property is object */
export function readPropertyValue<T extends EventArgType>(
  value: T | undefined | null,
  read: 'id' | 'url' | 'object'
) {
  if (read === 'object') {
    return value;
  }
  return value && value.upload?.result
    ? value.upload?.result[read] ?? undefined
    : undefined;
}

/** @description Provides a javascript file instance decorator */
export function decorateBlob<T extends Record<string, unknown>>(
  value: File,
  decorate: T
) {
  for (const prop of Object.keys(decorate)) {
    Object.defineProperty(value, prop, {
      value: decorate[prop],
    });
  }
  return value as File & T;
}
