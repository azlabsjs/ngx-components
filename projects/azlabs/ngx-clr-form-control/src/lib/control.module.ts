import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { NgxFormControlComponent } from './control.component';
import { TRANSLATIONS_DICTIONARY } from './tokens';
import { defaultStrings } from './constants';
import { of } from 'rxjs';
import {
  NgxUploadsEventsService,
  UploadOptionsType,
  provideUploadOptions,
} from '@azlabsjs/ngx-file-input';
import {
  OptionsQueryConfigType,
  provideCacheConfig,
  provideQueryClient,
} from '@azlabsjs/ngx-options-input';
import '@cds/core/icon/register.js';

type ConfigType = {
  translationsProvider?: Provider;
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

/** @deprecated Use `CLR_FORM_CONTROL_DIRECTIVES` to use exported directives */
@NgModule({
  imports: [NgxFormControlComponent],
  exports: [NgxFormControlComponent],
})
export class NgxClrFormControlModule {
  /** @deprecated Use `provideTranslations(...) from @azlabsjs/ngx-smart-form` to register translations provider
   * `provideQueryClient(...) from @azlabsjs/ngx-options-input` to register options request client providers and
   * `provideUploadOptions(...) from @azlabsjs/ngx-file-input` to register upload options providers
   */
  static forRoot(
    config?: ConfigType
  ): ModuleWithProviders<NgxClrFormControlModule> {
    const providers = [
      NgxUploadsEventsService,
      config?.translationsProvider ?? {
        provide: TRANSLATIONS_DICTIONARY,
        useValue: of(defaultStrings),
      },
      provideQueryClient(config?.options?.requests ?? {}, config?.options?.url),
      provideCacheConfig(
        config?.options?.cacheTTL,
        config?.options?.refreshInterval
      ),
    ];

    if (typeof config?.uploads !== 'undefined' && config?.uploads !== null) {
      providers.push(
        provideUploadOptions(
          config?.uploads.options.path || config?.uploads.url,
          config?.uploads.options
        )
      );
    }
    return {
      ngModule: NgxClrFormControlModule,
      providers,
    };
  }
}
