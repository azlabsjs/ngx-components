import {
  NgModule,
  APP_INITIALIZER,
  ModuleWithProviders,
  Provider,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClarityModule } from '@clr/angular';
import {
  DropzoneConfig,
  DropzoneDict,
  DROPZONE_CONFIG,
  DROPZONE_DICT,
  NgxDropzoneModule,
  useDefaultDictionary,
} from '@iazlabs/ngx-dropzone';
import { NgxIntlTelInputModule } from '@iazlabs/ngx-intl-tel-input';
import {
  CACHE_PROVIDER,
  DYNAMIC_FORM_LOADER,
  FormHttpLoader,
  FormsCacheProvider,
  ReactiveFormBuilderBrige,
} from './services';
import { SafeHTMLPipe, TemplateMessagesPipe } from './pipes';
import {
  FORM_CLIENT,
  ANGULAR_REACTIVE_FORM_BRIDGE,
  OPTIONS_INPUT_ITEMS_CLIENT,
  HTTP_REQUEST_CLIENT,
  TEMPLATE_DICTIONARY,
} from './types/tokens';
import { JSONFormsClient } from './services/client';
import { CacheProvider } from '../core';
import { API_BINDINGS_ENDPOINT, API_HOST } from './types/tokens';
import {
  DynamicTextAreaInputComponent,
  NgxSmartCheckBoxComponent,
  NgxSmartDateInputComponent,
  NgxSmartFileInputComponent,
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormControlComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormGroupHeaderPipe,
  NgxSmartNumberInputComponent,
  NgxSmartPasswordInputComponent,
  NgxSmartRadioInputComponent,
  NgxSmartSelectInputComponent,
  PhoneInputComponent,
  TextInputComponent,
} from './components';
import { FetchOptionsDirective, HTMLFileInputDirective } from './directives';
import { createSelectOptionsQuery, createSubmitHttpHandler } from '../http';
import { lastValueFrom, of } from 'rxjs';
import { useDefaultTemplateText } from './helpers';

type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

export type ModuleConfigs = {
  dropzoneConfigs?: DropzoneConfig;
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
};

export function preloadAppForms(service: CacheProvider, assetsURL: string) {
  return async () => {
    return await lastValueFrom(
      service.cache(assetsURL || '/assets/resources/forms.json')
    );
  };
}

export function createDictionary(dzConfig: { [index: string]: any }) {
  const iterable = [];
  for (const [key, value] of Object.entries(dzConfig)) {
    if (key.startsWith('dict')) {
      iterable.push([key, value]);
    }
  }
  return Object.fromEntries(iterable);
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    ClarityModule,
    NgxDropzoneModule,
  ],
  declarations: [
    NgxSmartFileInputComponent,
    NgxSmartSelectInputComponent,
    PhoneInputComponent,
    NgxSmartDateInputComponent,
    DynamicTextAreaInputComponent,
    NgxSmartNumberInputComponent,
    TextInputComponent,
    NgxSmartPasswordInputComponent,
    NgxSmartCheckBoxComponent,
    NgxSmartRadioInputComponent,
    NgxSmartFormComponent,
    NgxSmartFormGroupComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    NgxSmartFormControlComponent,
    NgxSmartFormGroupHeaderPipe,
    SafeHTMLPipe,
    TemplateMessagesPipe,
    FetchOptionsDirective,
    HTMLFileInputDirective,
  ],
  exports: [
    NgxSmartFormComponent,
    NgxSmartFormGroupComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    NgxSmartFormControlComponent,
    SafeHTMLPipe,
    TemplateMessagesPipe,
    FetchOptionsDirective,
    HTMLFileInputDirective,
  ],
  providers: [],
})
export class NgxSmartFormModule {
  static forRoot(
    configs: ModuleConfigs
  ): ModuleWithProviders<NgxSmartFormModule> {
    const providers: Provider[] = [
      FormHttpLoader,
      {
        provide: DYNAMIC_FORM_LOADER,
        useClass: FormHttpLoader,
      },
      FormsCacheProvider,
      {
        provide: CACHE_PROVIDER,
        useClass: FormsCacheProvider,
      },
      JSONFormsClient,
      {
        provide: FORM_CLIENT,
        useClass: JSONFormsClient,
      },
      ReactiveFormBuilderBrige,
      {
        provide: API_HOST,
        useValue: configs!.serverConfigs!.api.host || undefined,
      },
      {
        provide: API_BINDINGS_ENDPOINT,
        useValue: configs!.serverConfigs!.api.bindings || 'control-bindings',
      },
      {
        provide: APP_INITIALIZER,
        useFactory: (service: CacheProvider) =>
          preloadAppForms(
            service,
            configs!.formsAssets || '/assets/resources/app-forms.json'
          ),
        multi: true,
        deps: [CACHE_PROVIDER],
      },
      {
        provide: ANGULAR_REACTIVE_FORM_BRIDGE,
        useClass: ReactiveFormBuilderBrige,
      },
      {
        provide: 'FILE_STORE_PATH',
        useValue: configs!.serverConfigs.api.uploadURL ?? 'http://localhost',
      },
      {
        provide: OPTIONS_INPUT_ITEMS_CLIENT,
        useFactory: () => {
          return createSelectOptionsQuery(
            configs!.serverConfigs!.api.host,
            configs!.serverConfigs!.api.bindings
          );
        },
      },
      {
        provide: HTTP_REQUEST_CLIENT,
        useFactory: () => {
          return createSubmitHttpHandler(configs!.serverConfigs!.api.host);
        },
      },
      {
        provide: DROPZONE_DICT,
        useValue:
          typeof configs?.dropzoneConfigs === 'undefined' ||
          configs?.dropzoneConfigs === null ||
          Object.keys(configs?.dropzoneConfigs ?? {}).length === 0
            ? useDefaultDictionary()
            : createDictionary(configs?.dropzoneConfigs),
      },
      {
        provide: DROPZONE_CONFIG,
        useFactory: (dictionary: Partial<DropzoneDict>) => {
          const dzConfig = (configs?.dropzoneConfigs || {
            url: configs!.serverConfigs!.api.host ?? 'http://localhost',
            maxFilesize: 10,
            acceptedFiles: 'image/*',
            autoProcessQueue: false,
            uploadMultiple: false,
            maxFiles: 1,
            addRemoveLinks: true,
          }) as any;

          for (const [prop, value] of Object.entries(dictionary)) {
            if (
              !(prop in dzConfig) ||
              dzConfig[prop] === 'undefined' ||
              dzConfig[prop] === null
            ) {
              dzConfig[prop] = value;
            }
          }
          return dzConfig as DropzoneConfig;
        },
        deps: [DROPZONE_DICT],
      },
    ];
    providers.push(
      configs.templateTextProvider ?? {
        provide: TEMPLATE_DICTIONARY,
        useValue: of(useDefaultTemplateText()),
      }
    );
    return {
      ngModule: NgxSmartFormModule,
      providers: providers,
    };
  }
}
