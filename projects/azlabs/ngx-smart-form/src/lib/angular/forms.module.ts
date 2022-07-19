import {
  NgModule,
  APP_INITIALIZER,
  ModuleWithProviders,
  Provider,
  Injector,
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
} from '@azlabsjs/ngx-dropzone';
import { NgxIntlTelInputModule } from '@azlabsjs/ngx-intl-tel-input';
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
  INPUT_OPTIONS_CLIENT,
  HTTP_REQUEST_CLIENT,
  TEMPLATE_DICTIONARY,
  UPLOADER_OPTIONS,
  API_BINDINGS_ENDPOINT,
  API_HOST,
} from './types';
import { JSONFormsClient } from './services/client';
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
  NgxSmartTimeInputComponent,
  NgxSmartDzComponent,
} from './components';
import { FetchOptionsDirective, HTMLFileInputDirective } from './directives';
import { createSelectOptionsQuery, createSubmitHttpHandler } from '../http';
import { from, lastValueFrom, ObservableInput, of } from 'rxjs';
import { useDefaultTemplateText } from './helpers';
import { CacheProvider } from '@azlabsjs/smart-form-core';
import { UploadOptions } from '@azlabsjs/uploader';
import {
  HttpRequest,
  HttpResponse,
  Interceptor,
  RequestClient,
} from '@azlabsjs/requests';

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
  uploadOptions: Omit<
    UploadOptions<HttpRequest, HttpResponse>,
    'interceptor'
  > & {
    createInterceptor?: (injector: Injector) => Interceptor<HttpRequest>;
    createBackend?: (
      injector: Injector
    ) => RequestClient<HttpRequest, HttpResponse>;
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
      FormsCacheProvider,
      JSONFormsClient,
      ReactiveFormBuilderBrige,
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
          let interceptor!: Interceptor<HttpRequest>;
          let backend!: RequestClient<HttpRequest, HttpResponse>;
          const path =
            configs.uploadOptions.path || configs.serverConfigs.api.uploadURL;
          if (typeof configs.uploadOptions.createInterceptor === 'function') {
            interceptor = configs.uploadOptions.createInterceptor(injector);
            delete configs.uploadOptions['createInterceptor'];
          } //
          if (typeof configs.uploadOptions.createBackend === 'function') {
            backend = configs.uploadOptions.createBackend(injector);
            delete configs.uploadOptions['createBackend'];
          }
          return {
            ...configs.uploadOptions,
            interceptor,
            backend,
            path,
          } as UploadOptions<HttpRequest, HttpResponse>;
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
