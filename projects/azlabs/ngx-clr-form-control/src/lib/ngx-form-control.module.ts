import {
  inject,
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { NgxFormControlComponent } from './ngx-form-control.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgxCheckBoxInputComponent,
  NgxDateInputComponent,
  NgxNumberInputComponent,
  NgxPasswordInputComponent,
  NgxPhoneInputComponent,
  NgxRadioInputComponent,
  NgxSelectInputComponent,
  NgxTextInputComponent,
  NgxTextAreaInputComponent,
  NgxTimeInputComponent,
  NgxInputErrorModule,
} from './components';
import { TRANSLATIONS_DICTIONARY } from './tokens';
import { defaultStrings } from './constants';
import { isObservable, Observable, of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxIntlTelInputModule } from '@azlabsjs/ngx-intl-tel-input';
import {
  NgxFileInputModule,
  NgxUploadsEventsService,
  UPLOADER_OPTIONS,
  UploadOptionsType,
} from '@azlabsjs/ngx-file-input';
import {
  INPUT_OPTIONS_CLIENT,
  NgxOptionsInputModule,
  OPTIONS_CACHE,
  OptionsCache,
  optionsQueryClient,
  OptionsQueryConfigType,
} from '@azlabsjs/ngx-options-input';
import { ClarityModule } from '@clr/angular';
import '@cds/core/icon/register.js';
import { ClarityIcons, eyeHideIcon, eyeIcon } from '@cds/core/icon';
import { deepEqual } from '@azlabsjs/utilities';
import { NgxCommonModule } from './common';
import { Translations } from './types';

// Register clarity icons
ClarityIcons.addIcons(eyeHideIcon, eyeIcon);

type ConfigType = {
  translationsProvider?:
    | Provider
    | ((i: Injector | null) => Translations | Observable<Translations>);
  options?: {
    url?: string;
    requests: OptionsQueryConfigType;
    /**
     * Number of seconds after which item is automatically refetch
     */
    refreshInterval?: number;
    /**
     * Number of seconds after which item is no more valid in cache
     */
    cacheTTL?: number;
  };
  uploads?: {
    options: UploadOptionsType<any, any>;
    url: string;
  };
};

@NgModule({
  declarations: [
    NgxFormControlComponent,
    NgxCheckBoxInputComponent,
    NgxDateInputComponent,
    NgxNumberInputComponent,
    NgxPasswordInputComponent,
    NgxPhoneInputComponent,
    NgxRadioInputComponent,
    NgxSelectInputComponent,
    NgxTextInputComponent,
    NgxTextAreaInputComponent,
    NgxTimeInputComponent,
  ],
  imports: [
    CommonModule,
    NgxCommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxIntlTelInputModule,
    NgxFileInputModule,
    NgxOptionsInputModule,
    ClarityModule,
    NgxInputErrorModule,
  ],
  exports: [NgxFormControlComponent],
})
export class NgxClrFormControlModule {
  static forRoot(
    config?: ConfigType
  ): ModuleWithProviders<NgxClrFormControlModule> {
    let provider: Provider;

    if (typeof config?.translationsProvider === 'function') {
      const fn = config.translationsProvider as (
        i: Injector
      ) => Translations | Observable<Translations>;
      provider = {
        provide: TRANSLATIONS_DICTIONARY,
        useFactory: () => {
          const i = inject(Injector);
          const result = fn(i);
          return isObservable(result) ? result : of(result);
        },
      };
    } else {
      provider = config?.translationsProvider ?? {
        provide: TRANSLATIONS_DICTIONARY,
        useValue: of(defaultStrings),
      };
    }
    const providers = [
      NgxUploadsEventsService,
      provider,
      {
        provide: INPUT_OPTIONS_CLIENT,
        useFactory: (injector: Injector) => {
          return optionsQueryClient(
            injector,
            config?.options?.url,
            config?.options?.requests
          );
        },
        deps: [Injector],
      },
      {
        provide: OPTIONS_CACHE,
        useFactory: () => {
          return new OptionsCache(
            deepEqual,
            config?.options?.refreshInterval,
            config?.options?.cacheTTL
          );
        },
      },
    ];

    if (typeof config?.uploads !== 'undefined' && config?.uploads !== null) {
      providers.push({
        provide: UPLOADER_OPTIONS,
        useFactory: (injector: Injector) => {
          if (
            typeof config?.uploads?.options === 'undefined' ||
            config.uploads.options === null
          ) {
            return {
              path: config?.uploads?.url,
            };
          }
          return {
            ...config?.uploads.options,
            injector,
            path: config?.uploads.options.path || config?.uploads.url,
          };
        },
        deps: [Injector],
      });
    }
    return {
      ngModule: NgxClrFormControlModule,
      providers,
    };
  }
}
