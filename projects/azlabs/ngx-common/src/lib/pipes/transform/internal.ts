import { PipeTransform } from '@angular/core';

/**
 * @internal
 */
type ExceptFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/**
 * It provides a functional interface arround angular pipe instance
 *
 * @example
 * ```ts
 * export class MyComponent {
 *     private readonly pipe = createPipeTransform(this.pipe, 'users');
 *
 *     constructor(private pipe: DBSyncPipe) { }
 * }
 * ```
 */
export function createPipeTransform<T extends PipeTransform>(
  pipe: T,
  ...args: ExceptFirst<Parameters<T['transform']>>
) {
  return (value: any) => pipe.transform(value, ...args);
}


/**
 * Returns the strings after the first occurence the specified character
 *
 * @example
 * const substr = after('o', 'Hello World!'); // output " World!"
 *
 * @param char
 * @param haystack
 */
export function after(char: string, haystack: string) {
  const index = haystack.indexOf(char);
  return haystack.slice(index + char.length);
}

/**
 * Returns the strings before the first occurence the specified character
 *
 * @example
 * const substr = before('W', 'Hello World!'); // outputs -> "Hello "
 *
 * @param char
 * @param haystack
 */
export function before(char: string, haystack: string) {
  return haystack.slice(0, haystack.indexOf(char));
}

/**
 * Creates pipe transform parameter from provided transform definition rules
 */
export function createParams(transform: string) {
  const hasParams = transform.indexOf(':') !== -1;
  const pipe = hasParams ? before(':', transform) : transform;
  let params = hasParams
    ? after(':', transform)
        .split(';')
        .map((x) => x.trim()) ?? []
    : [];
  params = params.map((item) => {
    if (item.indexOf('json:') !== -1) {
      return JSON.parse(after('json:', item));
    }
    if (item.indexOf('js:') !== -1) {
      return JSON.parse(after('js:', item));
    }
    return item;
  });

  return [pipe, ...params];
}

/**
 * Compute the substring of the `value` string
 */
export function substr(value: string, start: number, length?: number) {
  if (typeof value !== 'string') {
    return '';
  }
  if (start > value.length) {
    return '';
  }
  start = start >= 0 ? start : value.length - Math.abs(start);
  if (start < 0) {
    return '';
  }
  return String(value).substring(start, length ? start + length : undefined);
}