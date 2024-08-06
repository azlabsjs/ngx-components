import { Injector } from '@angular/core';
import { Observable } from 'rxjs';

/** @internal type declaration of translation object for a given module */
export type TranslationsType<
  TKey extends string | symbol | number = string,
  TValue = unknown
> = Record<TKey, TValue>;

/** @internal Type declaration for translation provider type */
export type ProvideTranslationsType<
  T extends TranslationsType = TranslationsType
> = T | Observable<T> | ((injector: Injector) => Observable<T>);

/** @deprecated type declaration of the common string object for a given module */
export type CommonStringsType<
  TKey extends string | symbol | number = string,
  TValue = unknown
> = TranslationsType<TKey, TValue>;

/** @deprecated Type declaration for common strings provider type */
export type ProvideCommonStringsType<
  T extends CommonStringsType = CommonStringsType
> = ProvideTranslationsType<T>;
