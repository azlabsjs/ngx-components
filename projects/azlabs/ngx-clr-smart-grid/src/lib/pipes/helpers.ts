import { PipeTransform } from '@angular/core';

type ExceptFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/**
 * Function creator that uses the {@see DBSyncPipe} to resolve
 * data metadata base on the provided user/developper configurations.
 *
 * It provides a functional interface arround angular
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
  return (value: any) => {
    return pipe.transform(value, ...args);
  };
}
