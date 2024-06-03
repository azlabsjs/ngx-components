import { ModuleWithProviders, NgModule } from '@angular/core';
import { Country } from './core';
import { NgxIntlTelInputComponent } from './intl-tel-input.component';
import { provideSupportedCountries } from './providers';

/**
 * @deprecated 0.15.5x
 *
 * In future (0.16.x) release, the component will be converted into a standalone component
 * therefore there will be no need to use the `NgxIntlTelInputModule` anymore
 * 
 * **Note** From >=0.17.x import tel input component via `import {INTL_TEL_INPUT_DIRECTIVES} from '@azlabsjs/ngx-intl-tel-input'`
 */
@NgModule({
  imports: [NgxIntlTelInputComponent],
  exports: [NgxIntlTelInputComponent],
})
export class NgxIntlTelInputModule {
  /**
   * @deprecated 0.15.5x
   *
   * forRoot() is deprecated, consider using `provideSupportedCountries()`, `provideCountries()`
   * and `providePreferredCountries()` for provides module configurations
   */
  static forRoot(configs?: {
    countries: Country[] | (() => Country[]);
  }): ModuleWithProviders<NgxIntlTelInputModule> {
    const countries = configs?.countries ?? ([] as Country[]);
    const values = typeof countries === 'function' ? countries() : countries;
    return {
      ngModule: NgxIntlTelInputModule,
      providers: [provideSupportedCountries(values.map((v) => v.iso2))],
    };
  }
}
