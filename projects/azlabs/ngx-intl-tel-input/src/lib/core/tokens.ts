import { InjectionToken } from '@angular/core';
import { Country } from './model';
import { ISO3166 } from './ios3166';
import { getPhoneNumberPlaceholder } from './internal';
import { PhoneNumberFormat } from 'google-libphonenumber';

/**
 * @description ISO3166 Injectable instance
 */
export const COUNTRIES = new InjectionToken<Country[]>(
  'ISO3166 countries injectable token',
  {
    providedIn: 'root',
    factory: () => {
      return ISO3166.map((country) => ({
        name: country[0].toString(),
        iso2: country[1].toString(),
        dialCode: country[2].toString(),
        priority: +country[3] || 0,
        areaCode: +country[4] || undefined,
        flagClass: country[1].toString().toLocaleLowerCase(),
        placeHolder: `${getPhoneNumberPlaceholder(
          country[1].toString().toUpperCase(),
          PhoneNumberFormat.NATIONAL
        )}`,
      }));
    },
  }
);

/**
 * @description Injection token allowing applications to configure supported countries
 */
export const SUPPORTED_COUNTRIES = new InjectionToken<Country[]>("Injection Token for supported countries");