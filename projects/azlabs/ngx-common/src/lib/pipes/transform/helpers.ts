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
