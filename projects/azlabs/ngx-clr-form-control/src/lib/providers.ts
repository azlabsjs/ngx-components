import { Injector, Provider, inject } from '@angular/core';
import { Translations } from './types';
import { TRANSLATIONS_DICTIONARY } from './tokens';
import { of } from 'rxjs';
import { defaultStrings } from './constants';

/** @description Provide translation values for form component description, errors, etc... */
export function provideTranslations(
  translations: Translations | ((injector: Injector) => Translations)
) {
  return {
    provide: TRANSLATIONS_DICTIONARY,
    useFactory: () => {
      return typeof translations === 'function'
        ? translations(inject(Injector))
        : translations ?? of(defaultStrings);
    },
  } as Provider;
}
