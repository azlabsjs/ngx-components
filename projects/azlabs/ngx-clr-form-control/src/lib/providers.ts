import { Injector, Provider, inject, ɵisSubscribable } from '@angular/core';
import { Translations } from './types';
import { TRANSLATIONS_DICTIONARY } from './tokens';
import { of } from 'rxjs';
import { defaultStrings } from './constants';

/** @internal */
type TranslationsType = {
  validation: typeof defaultStrings.validation;
} & Record<string, any>;

/** @description Provide translation values for form component description, errors, etc... */
export function provideTranslations(
  translations:
    | TranslationsType
    | Translations<TranslationsType>
    | ((injector: Injector) => Translations<TranslationsType>)
) {
  return {
    provide: TRANSLATIONS_DICTIONARY,
    useFactory: () => {
      return typeof translations === 'function'
        ? translations(inject(Injector))
        : translations
        ? ɵisSubscribable(translations)
          ? translations
          : of(translations)
        : of(defaultStrings);
    },
  } as Provider;
}
