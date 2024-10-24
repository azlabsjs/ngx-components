import { Pipe, PipeTransform } from '@angular/core';
import { Subscribable } from 'rxjs';

/** @internal Determine if the argument is shaped like a Promise */
export function isPromise<T = unknown>(obj: any): obj is Promise<T> {
  return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is a Subscribable
 */
export function isSubscribable<T>(
  obj: any | Subscribable<T>
): obj is Subscribable<T> {
  return !!obj && typeof obj.subscribe === 'function';
}

/**
 * Determine if the argument is an async variable [an observable or an A+ promise]
 */
export function isAsync<T = any>(value: unknown): value is T {
  return isPromise(value) || isSubscribable(value);
}

@Pipe({
  name: 'isAsync',
  pure: true,
})
export class IsAsyncPipe implements PipeTransform {
  // Transform function that returns true if value is a promise, or an observable
  transform(value: unknown) {
    return isAsync(value);
  }
}
