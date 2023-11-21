import { Inject, Injectable, Optional } from '@angular/core';
import { Country } from './model';
import { COUNTRIES, PREFERRED_COUNTRIES, SUPPORTED_COUNTRIES } from './tokens';
import {
  getPhoneNumberPlaceholder,
  phoneNumberAsString,
  safeValidatePhoneNumber,
} from './internal';
import { parsePhoneNumber, ParsedPhoneNumber } from 'awesome-phonenumber';

@Injectable()
export class IntlTelInput {
  //

  /**
   * Create and instance of Intel Input Service
   *
   * @param countries
   */
  constructor(
    @Inject(COUNTRIES) private countries: Country[] = [],
    @Inject(SUPPORTED_COUNTRIES)
    @Optional()
    private supportedCountries: string[] = [],
    @Inject(PREFERRED_COUNTRIES)
    @Optional()
    private preferredCountries: string[] = []
  ) {}

  /**
   * @description Returns a list of supported countries
   */
  public fetchCountries(): Country[] {
    const supportedCountries = this.supportedCountries ?? [];
    if (supportedCountries?.length > 0) {
      return supportedCountries
        .map((v) => this.countries.find((c) => c.iso2 === v))
        .filter((v) => typeof v !== 'undefined' && v !== null) as Country[];
    }
    return this.countries;
  }

  /**
   * Returns the list of preferred countries for the application
   */
  public fetchPreferredCountries(): string[] {
    const countries = this.preferredCountries;
    if (countries && countries.length > 0) {
      return countries;
    }
    return ['tg', 'bj', 'gh'];
  }

  /**
   * @description Get country code from a phone number string
   *
   * @param input
   */
  public getCountryCode(input: string) {
    const result = this.parse(input);
    return typeof result !== 'undefined' && result !== null
      ? result.countryCode
      : undefined;
  }

  /**
   * @description Parse a phone number string into an instance of
   * phone number object
   *
   * @param input
   */
  public parse(input: string, regionCode?: string) {
    if (typeof input === 'undefined' || input === null) {
      return undefined;
    }
    try {
      input =
        input.toString().startsWith('+') || input.toString().startsWith('00')
          ? input
          : `+${input}`;
      return parsePhoneNumber(input, regionCode ? { regionCode } : undefined);
    } catch (e) {
      return undefined;
    }
  }

  /**
   * @description Returns true if the phone number is a valid phone number
   * based on intl/local phone number format
   *
   * @param num Phone number to ve validated
   */
  public isValidPhoneNumber(num: ParsedPhoneNumber): boolean {
    return num.valid;
  }

  /**
   * Format a phone number object as string
   *
   * @param num
   */
  public format(num: ParsedPhoneNumber) {
    return phoneNumberAsString(num);
  }

  /**
   * @description Add or remove unwanted character from the phone number string
   *
   * @param num
   */
  public isSafeValidPhoneNumber(num: string, regionCode?: string) {
    return safeValidatePhoneNumber(num, regionCode);
  }

  /**
   * @description Get phone number place holder based on user provided country code
   *
   * @param countryCode
   */
  getPhoneNumberPlaceHolder(countryCode: string) {
    return getPhoneNumberPlaceholder(countryCode);
  }
}
