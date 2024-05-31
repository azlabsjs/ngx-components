import { Injector, Provider } from '@angular/core';
import {
  COUNTRIES,
  Country,
  PREFERRED_COUNTRIES,
  SUPPORTED_COUNTRIES,
} from './core';

/**  @internal Resolve the list of country using angular injector */
function resolveCountries(
  injector: Injector,
  values: Country[] | ((injector: Injector) => Country[])
) {
  const _countries = typeof values === 'function' ? values(injector) : values;
  if (_countries instanceof Array) {
    return _countries.filter(
      (country) =>
        typeof country === 'object' &&
        typeof country.iso2 !== 'undefined' &&
        typeof country.name !== 'undefined' &&
        typeof country.dialCode !== 'undefined'
    );
  }
  return [];
}

/** @description Provides a global list of preferred countries for the application */
export function providePreferredCountries(values: string[]) {
  return {
    provide: PREFERRED_COUNTRIES,
    useFactory: () => values,
  } as Provider;
}

/** @description Provide a global list of supported countries to be displayed by the phone input dropdown */
export function provideSupportedCountries(
  values: string[] | ((injector: Injector) => string[])
) {
  return {
    provide: SUPPORTED_COUNTRIES,
    useFactory: (injector: Injector) =>
      typeof values === 'function' ? values(injector) : values,
    deps: [Injector],
  } as Provider;
}

/** @description Provide a global list of countries to be displayed by the phone input dropdown */
export function provideCountries(
  values: Country[] | ((injector: Injector) => Country[])
) {
  return {
    provide: COUNTRIES,
    useFactory: (injector: Injector) => resolveCountries(injector, values),
    deps: [Injector],
  } as Provider;
}
