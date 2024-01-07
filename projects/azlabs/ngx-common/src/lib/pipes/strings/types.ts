import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @internal
 * Type declaration of the common string object for a given module
 */
export type CommonStringsType<
  TKey extends string | symbol | number = string,
  TValue = unknown
> = Record<TKey, TValue>;

/**
 * Type declaration for common strings provider type
 */
export type ProvideCommonStringsType<
  T extends CommonStringsType = CommonStringsType
> = T | Observable<T> | ((injector: Injector) => Observable<T>);
