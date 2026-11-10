import { Injector, Provider, inject } from '@angular/core';
import { TranslationsType, ProvideTranslationsType } from './types';
import { Observable, isObservable, of } from 'rxjs';
import { COMMON_STRINGS } from './tokens';


/** @description provides application translated strings */
export function provideTranslations(values: ProvideTranslationsType) {
  return typeof values === 'function' ? provideTranslationsFactory(values) : provideTranslationsValue(values);
}

/** @description provides common string token using value of object type or an observable of object type */
function provideTranslationsValue(values: TranslationsType | Observable<TranslationsType>) {
  return {
    provide: COMMON_STRINGS,
    useFactory: () => {
      return isObservable(values) ? values : of(values);
    },
  } as Provider;
}

/** @description provides common string token using a factory function. Factory function allows developper to get a dependency from the injector instance */
function provideTranslationsFactory(factory: (injector: Injector) => Observable<TranslationsType>) {
  return {
    provide: COMMON_STRINGS,
    useFactory: () => {
      return factory(inject(Injector));
    },
  } as Provider;
}
