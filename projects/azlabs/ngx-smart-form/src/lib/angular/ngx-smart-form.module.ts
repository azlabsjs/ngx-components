import { CommonModule } from '@angular/common';
import {
  APP_INITIALIZER,
  Injector,
  ModuleWithProviders,
  NgModule,
  Provider,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTPRequest } from '@azlabsjs/requests';
import { CacheProvider } from '@azlabsjs/smart-form-core';
import { from, lastValueFrom, ObservableInput, of } from 'rxjs';
import { createSubmitHttpHandler } from '../http';
import {
  NgxSmartArrayAddButtonComponent,
  NgxSmartArrayCloseButtonComponent,
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormControlArrayChildComponent,
  NgxSmartFormControlArrayComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormGroupHeaderPipe,
} from './components';
import { SafeHTMLPipe } from './pipes';
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
  API_HOST,
  FORM_CLIENT,
  HTTP_REQUEST_CLIENT,
  InterceptorFactory,
} from './types';


type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

type ConfigType = {
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
  submitRequest?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
};

/**
 * @internal
 *
 * @param service
 * @param assetsURL
 */
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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    NgxSmartFormComponent,
    NgxSmartFormGroupComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    NgxSmartFormGroupHeaderPipe,
    SafeHTMLPipe,
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
    SafeHTMLPipe,
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
        provide: HTTP_REQUEST_CLIENT,
        useFactory: (injector: Injector) =>
          createSubmitHttpHandler(
            injector,
            configs!.serverConfigs!.api.host,
            configs.submitRequest?.interceptorFactory
          ),
        deps: [Injector],
      },
    ];
    return {
      ngModule: NgxSmartFormModule,
      providers: providers,
    };
  }
}
