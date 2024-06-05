import { Injectable, Pipe, PipeTransform, ɵisPromise, ɵisSubscribable } from '@angular/core';
import { Subscribable } from 'rxjs';

/** @deprecated Determine if the argument is shaped like a Promise */
export function isPromise<T = unknown>(obj: any): obj is Promise<T> {
  return !!obj && typeof obj.then === 'function';
}

/** @deprecated Determine if the argument is a Subscribable */
export function isSubscribable<T>(
  obj: any | Subscribable<T>
): obj is Subscribable<T> {
  return !!obj && typeof obj.subscribe === 'function';
}

/** @description Determine if the argument is an async variable [an observable or an A+ promise */
export function isAsync<T = any>(value: unknown): value is T {
  return ɵisPromise(value) || ɵisSubscribable(value);
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'isAsync',
})
@Injectable({ providedIn: 'any' })
export class IsAsyncPipe implements PipeTransform {
  // Transform function that returns true if value is a promise, or an observable
  transform(value: unknown) {
    return isAsync(value);
  }
}
