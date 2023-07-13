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
import { NgxFileInputModule } from '@azlabsjs/ngx-file-input';
import {
  INPUT_OPTIONS_CLIENT,
  NgxOptionsInputModule,
  optionsQueryClient,
  OptionsQueryConfigType,
} from '@azlabsjs/ngx-options-input';
import { ClarityModule } from '@clr/angular';

type ConfigType = {
  translationsProvider?: Provider;
  optionsHost?: string;
  optionsPath?: string;
  optionsRequest: OptionsQueryConfigType;
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
    return {
      ngModule: NgxClrFormControlModule,
      providers: [
        config?.translationsProvider ?? {
          provide: TRANSLATIONS_DICTIONARY,
          useValue: of(defaultTranslations()),
        },
        {
          provide: INPUT_OPTIONS_CLIENT,
          useFactory: (injector: Injector) => {
            return optionsQueryClient(
              injector,
              config?.optionsHost,
              config?.optionsPath,
              config?.optionsRequest
            );
          },
          deps: [Injector],
        },
      ],
    };
  }
}
