import { CommonModule } from '@angular/common';
import {
  APP_INITIALIZER,
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DROPZONE_CONFIG,
  DROPZONE_DICT,
  DropzoneConfig,
  DropzoneDict,
  NgxDropzoneModule,
  useDefaultDictionary,
} from '@azlabsjs/ngx-dropzone';
import { NgxIntlTelInputModule } from '@azlabsjs/ngx-intl-tel-input';
import { HTTPRequest, HTTPResponse } from '@azlabsjs/requests';
import { CacheProvider } from '@azlabsjs/smart-form-core';
import { ClarityModule } from '@clr/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { ObservableInput, from, lastValueFrom, of } from 'rxjs';
import {
  OptionsQueryConfigType,
  createSelectOptionsQuery,
  createSubmitHttpHandler,
} from '../http';
import {
  DynamicTextAreaInputComponent,
  NgxSmartArrayAddButtonComponent,
  NgxSmartArrayCloseButtonComponent,
  NgxSmartCheckBoxComponent,
  NgxSmartDateInputComponent,
  NgxSmartDzComponent,
  NgxSmartFileInputComponent,
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormControlArrayChildComponent,
  NgxSmartFormControlArrayComponent,
  NgxSmartFormControlComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormGroupHeaderPipe,
  NgxSmartNumberInputComponent,
  NgxSmartPasswordInputComponent,
  NgxSmartRadioInputComponent,
  NgxSmartSelectInputComponent,
  NgxSmartTimeInputComponent,
  PhoneInputComponent,
  TextInputComponent,
} from './components';
import { NgxUploadsSubjectService } from './components/ngx-smart-file-input/ngx-uploads-subject.service';
import { FetchOptionsDirective, HTMLFileInputDirective } from './directives';
import { useDefaultTemplateText } from './helpers';
import { SafeHTMLPipe, TemplateMessagesPipe } from './pipes';
import {
  CACHE_PROVIDER,
  DYNAMIC_FORM_LOADER,
  FormHttpLoader,
  FormsCacheProvider,
  ReactiveFormBuilderBrige,
} from './services';
import { JSONFormsClient } from './services/client';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  API_BINDINGS_ENDPOINT,
  API_HOST,
  FORM_CLIENT,
  HTTP_REQUEST_CLIENT,
  INPUT_OPTIONS_CLIENT,
  InterceptorFactory,
  TEMPLATE_DICTIONARY,
  UPLOADER_OPTIONS,
  UploadOptionsType,
} from './types';

type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

type ConfigType = {
  dropzoneConfigs?: DropzoneConfig;
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
  uploadOptions?: UploadOptionsType<HTTPRequest, HTTPResponse>;
  optionsRequest?: OptionsQueryConfigType;
  submitRequest?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
};

export function preloadAppForms(service: CacheProvider, assetsURL: string) {
  return async () => {
    return await lastValueFrom(
      from(
        service.cache(
          assetsURL || '/assets/resources/forms.json'
        ) as ObservableInput<unknown>
      )
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
    NgxSmartTimeInputComponent,
    SafeHTMLPipe,
    TemplateMessagesPipe,
    FetchOptionsDirective,
    HTMLFileInputDirective,
    NgxSmartDzComponent,
    NgxSmartArrayCloseButtonComponent,
    NgxSmartArrayAddButtonComponent,
    NgxSmartFormControlArrayChildComponent,
    NgxSmartFormControlArrayComponent,
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
  static forRoot(configs: ConfigType): ModuleWithProviders<NgxSmartFormModule> {
    const providers: Provider[] = [
      FormHttpLoader,
      FormsCacheProvider,
      JSONFormsClient,
      ReactiveFormBuilderBrige,
      NgxUploadsSubjectService,
      {
        provide: DYNAMIC_FORM_LOADER,
        useClass: FormHttpLoader,
      },
      {
        provide: CACHE_PROVIDER,
        useClass: FormsCacheProvider,
      },
      {
        provide: FORM_CLIENT,
        useClass: JSONFormsClient,
      },
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
        provide: INPUT_OPTIONS_CLIENT,
        useFactory: (injector: Injector) => {
          return createSelectOptionsQuery(
            injector,
            configs!.serverConfigs!.api.host,
            configs!.serverConfigs!.api.bindings,
            configs.optionsRequest
          );
        },
        deps: [Injector],
      },
      {
        provide: HTTP_REQUEST_CLIENT,
        useFactory: (injector: Injector) =>
          createSubmitHttpHandler(
            injector,
            configs!.serverConfigs!.api.host,
            configs.submitRequest?.interceptorFactory
          ),
        deps: [Injector],
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
            acceptedFiles: '*/*',
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
      {
        provide: UPLOADER_OPTIONS,
        useFactory: (injector: Injector) => {
          if (
            typeof configs.uploadOptions === 'undefined' ||
            configs.uploadOptions === null
          ) {
            return {
              path: configs.serverConfigs.api.uploadURL,
            };
          }
          return {
            ...configs.uploadOptions,
            injector,
            path:
              configs.uploadOptions.path || configs.serverConfigs.api.uploadURL,
          } as UploadOptionsType<HTTPRequest, HTTPResponse>;
        },
        deps: [Injector],
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
