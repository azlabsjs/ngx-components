import {
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { NgxFormControlComponent } from './ngx-form-control.component';
import { DateInputPipe } from './pipes/date-input.pipe';
import { FileInputPipe } from './pipes/file-input.pipe';
import { NumberInputPipe } from './pipes/number-input.pipe';
import { SelectInputPipe } from './pipes/select-input.pipe';
import { TextAreaInputPipe } from './pipes/text-area.input.pipe';
import { TextInputPipe } from './pipes/text-input.pipe';
import { TimeInputPipe } from './pipes/time-input.pipe';
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
} from './components';
import { TRANSLATIONS_DICTIONARY } from './tokens';
import { defaultTranslations } from './constants';
import { of } from 'rxjs';
import { TranslatePipe } from './pipes/translate.pipe';
import { TrustHTMLPipe } from './pipes/safe-html.pipe';
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
  optionsQueryClient,
  OptionsQueryConfigType,
} from '@azlabsjs/ngx-options-input';
import { ClarityModule } from '@clr/angular';

type ConfigType = {
  translationsProvider?: Provider;
  options?: {
    url?: string;
    requests: OptionsQueryConfigType;
  };
  uploads?: {
    options: UploadOptionsType<any, any>;
    url: string;
  };
};

@NgModule({
  declarations: [
    NgxFormControlComponent,
    DateInputPipe,
    FileInputPipe,
    NumberInputPipe,
    SelectInputPipe,
    TextAreaInputPipe,
    TextInputPipe,
    TimeInputPipe,
    TranslatePipe,
    TrustHTMLPipe,
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
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxIntlTelInputModule,
    NgxFileInputModule,
    NgxOptionsInputModule,
    ClarityModule,
  ],
  exports: [NgxFormControlComponent],
})
export class NgxClrFormControlModule {
  static forRoot(
    config?: ConfigType
  ): ModuleWithProviders<NgxClrFormControlModule> {
    const providers = [
      NgxUploadsEventsService,
      config?.translationsProvider ?? {
        provide: TRANSLATIONS_DICTIONARY,
        useValue: of(defaultTranslations()),
      },
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
