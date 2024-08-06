import { Injector, Provider, inject } from '@angular/core';
import { TranslationsType, ProvideTranslationsType } from './types';
import { Observable, isObservable, of } from 'rxjs';
import { COMMON_STRINGS } from './tokens';

/** @deprecated use `provideTranslations(...)` API instead */
export function provideCommonStrings(values: ProvideTranslationsType) {
  return typeof values === 'function'
    ? provideCommonStringsFactory(values)
    : provideCommonStringsValue(values);
}

/** @description provides application translated strings */
export function provideTranslations(values: ProvideTranslationsType) {
  return typeof values === 'function'
    ? provideCommonStringsFactory(values)
    : provideCommonStringsValue(values);
}

/** @description Provide common string token using value of object type or an observable of object type */
function provideCommonStringsValue(
  values: TranslationsType | Observable<TranslationsType>
) {
  return {
    provide: COMMON_STRINGS,
    useFactory: () => {
      return isObservable(values) ? values : of(values);
    },
  } as Provider;
}

/** @description Provides common string token using a factory function. Factory function allows developper to get a dependency from the injector instance */
export function provideCommonStringsFactory(
  factory: (injector: Injector) => Observable<TranslationsType>
) {
  return {
    provide: COMMON_STRINGS,
    useFactory: () => {
      return factory(inject(Injector));
    },
  } as Provider;
}
