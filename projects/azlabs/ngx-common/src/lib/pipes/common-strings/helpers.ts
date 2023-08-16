import { Injector, Provider } from '@angular/core';
import { CommonStringsType, ProvideCommonStringsType } from './types';
import { Observable, isObservable, of } from 'rxjs';
import { COMMON_STRINGS } from './tokens';

/**
 * Provide a common strings token
 */
export function provideCommonStrings(values: ProvideCommonStringsType) {
  return typeof values === 'function'
    ? provideCommonStringsFactory(values)
    : provideCommonStringsValue(values);
}

/**
 * Provide common string token using value of object type or an observable of object type
 */
function provideCommonStringsValue(
  values: CommonStringsType | Observable<CommonStringsType>
) {
  return {
    provide: COMMON_STRINGS,
    useFactory: () => {
      return isObservable(values) ? values : of(values);
    },
  } as Provider;
}

/**
 * Provides common string token using a factory function. Factory function allows
 * developper to get a dependency from the injector instance
 */
export function provideCommonStringsFactory(
  factory: (injector: Injector) => Observable<CommonStringsType>
) {
  return {
    provide: COMMON_STRINGS,
    useFactory: (injector: Injector) => {
      return factory(injector);
    },
    deps: [Injector],
  } as Provider;
}
