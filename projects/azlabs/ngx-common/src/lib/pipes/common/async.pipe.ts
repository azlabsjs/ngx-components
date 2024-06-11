import {
  Injectable,
  Injector,
  Optional,
  Pipe,
  PipeTransform,
  ɵisPromise,
  ɵisSubscribable,
} from '@angular/core';
import { Subscribable, from, isObservable, of } from 'rxjs';

// TODO: Uncomment the code below to use custom implementation instead of implementation from angular
// /** @deprecated Determine if the argument is shaped like a Promise */
// export function isPromise<T = unknown>(obj: any): obj is Promise<T> {
//   return !!obj && typeof obj.then === 'function';
// }

// TODO: Uncomment the code below to use custom implementation instead of implementation from angular
// /** @deprecated Determine if the argument is a Subscribable */
// export function isSubscribable<T>(
//   obj: any | Subscribable<T>
// ): obj is Subscribable<T> {
//   return !!obj && typeof obj.subscribe === 'function';
// }

/** @description Determine if the argument is an async variable [an observable or an A+ promise */
export function isAsync<T = any>(value: unknown): value is T {
  return ɵisPromise(value) || ɵisSubscribable(value);
}

@Pipe({
  standalone: true,
  name: 'asObservable',
  pure: true,
})
export class AsObservablePipe implements PipeTransform {
  constructor(@Optional() private injector?: Injector) {}

  /** @description Transform or convert basic value to an observable of T value. */
  transform(value: any) {
    const v = typeof value === 'function' ? value(this.injector) : value;
    return isObservable(v) || ɵisPromise(v) ? from<any>(v) : of<any>(v);
  }
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
