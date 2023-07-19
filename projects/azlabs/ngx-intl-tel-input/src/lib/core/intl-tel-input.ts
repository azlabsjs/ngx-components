import { Inject, Injectable, Optional } from '@angular/core';
import { Country } from './model';
import {
  PhoneNumberUtil,
  PhoneNumberFormat,
  PhoneNumber,
} from 'google-libphonenumber';
import { COUNTRIES, SUPPORTED_COUNTRIES } from './tokens';
import {
  getPhoneNumberPlaceholder,
  phoneNumberAsString,
  safeValidatePhoneNumber,
} from './internal';

@Injectable()
export class IntlTelInput {
  //
  private instance: PhoneNumberUtil;

  /**
   * Create and instance of Intel Input Service
   *
   * @param countries
   */
  constructor(
    @Inject(COUNTRIES) private countries: Country[],
    @Inject(SUPPORTED_COUNTRIES)
    @Optional()
    private supportedCountries: Country[] = []
  ) {
    this.instance = PhoneNumberUtil.getInstance();
  }

  /**
   * @description Returns a list of supported countries
   */
  public fetchCountries(): Country[] {
    const supportedCountries = this.supportedCountries ?? [];
    if (supportedCountries?.length > 0) {
      return supportedCountries;
    }
    return this.countries;
  }

  /**
   * @description Get country code from a phone number string
   *
   * @param input
   */
  public getCountryCode(input: string) {
    const instance = this.parse(input);
    return typeof instance !== 'undefined' && instance !== null
      ? instance.getCountryCode()
      : undefined;
  }

  /**
   * @description Parse a phone number string into an instance of
   * phone number object
   *
   * @param input
   */
  public parse(input: string) {
    if (typeof input === 'undefined' || input === null) {
      return undefined;
    }
    try {
      return this.instance.parseAndKeepRawInput(
        input.toString().startsWith('+') || input.toString().startsWith('00')
          ? input
          : `+${input}`
      );
    } catch (e) {
      return undefined;
    }
  }

  /**
   * @description Returns true if the phone number is a valid phone number
   * based on intl/local phone number format
   *
   * @param n Phone number to ve validated
   */
  public isValidPhoneNumber(n: PhoneNumber): boolean {
    return this.instance.isValidNumber(n);
  }

  /**
   * Format a phone number object as string
   *
   * @param phoneNumber
   * @param format
   */
  public format(phoneNumber: PhoneNumber, format: PhoneNumberFormat) {
    return phoneNumberAsString(this.instance, phoneNumber, format);
  }

  /**
   * @description Add or remove unwanted character from the phone number string
   *
   * @param phoneNumber
   */
  public isSafeValidPhoneNumber(phoneNumber: string) {
    return safeValidatePhoneNumber(this.instance, phoneNumber);
  }

  /**
   * @description Get phone number place holder based on user
   * provided country code
   *
   * @param countryCode
   */
  protected getPhoneNumberPlaceHolder(countryCode: string) {
    return getPhoneNumberPlaceholder(countryCode, PhoneNumberFormat.NATIONAL);
  }
}
