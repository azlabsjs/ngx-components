import { NgxIntlTelInputComponent } from './lib/intl-tel-input.component';

/*
 * Public API Surface of ngx-intl-tel-input
 */
export {
  COUNTRIES,
  SUPPORTED_COUNTRIES,
  PREFERRED_COUNTRIES,
} from './lib/core';
export { NgxIntlTelInputComponent } from './lib/intl-tel-input.component';
export { NgxIntlTelInputModule } from './lib/intl-tel-input.module';
export {
  provideCountries,
  providePreferredCountries,
  provideSupportedCountries,
} from './lib/providers';


/** Exported library directives */
export const INTL_TEL_INPUT_DIRECTIVES = [NgxIntlTelInputComponent] as const;