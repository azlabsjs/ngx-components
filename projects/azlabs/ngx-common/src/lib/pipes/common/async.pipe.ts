import { Injectable, Injector, Optional, Pipe, PipeTransform, ɵisPromise, ɵisSubscribable } from '@angular/core';
import { from, isObservable, of } from 'rxjs';


/** @description Determine if the argument is an async variable [an observable or an A+ promise */
export function isAsync<T = any>(value: unknown): value is T {
  return ɵisPromise(value) || ɵisSubscribable(value);
}

@Pipe({
  standalone: true,
  name: 'asObservable',
  pure: true,
})
@Injectable()
export class AsObservablePipe implements PipeTransform {
  constructor(@Optional() private injector?: Injector) { }

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
@Injectable()
export class IsAsyncPipe implements PipeTransform {
  transform(value: unknown) {
    return isAsync(value);
  }
}
