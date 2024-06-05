import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTPRequest } from '@azlabsjs/requests';
import {
  AddButtonComponent,
  CloseButtonComponent,
  NgxSmartFormArrayChildComponent,
  NgxSmartFormArrayComponent,
  NgxSmartFormComponent,
  NgxSmartFormControlArrayChildComponent,
  NgxSmartFormControlArrayComponent,
  NgxSmartFormGroupComponent,
  NgxSmartFormGroupHeaderPipe,
} from './directives';
import {
  SafeHTMLPipe,
  HasChildrenPipe,
  IsRepeatablePipe,
  IsHiddenPipe,
} from './pipes';
import { InterceptorFactory, LoadFormsRequestHandler } from './types';
import {
  provideFormsHost,
  provideFormsInitialization,
  provideFormsLoader,
  provideHttpClient,
} from './providers';

/**
 * @internal
 * API server configuration type declaration
 */
type FormApiServerConfigs = {
  api: {
    host?: string;
    bindings?: string;
    uploadURL?: string;
  };
};

/**
 * @internal
 * Module configuration type declaration
 */
type ConfigType = {
  serverConfigs: FormApiServerConfigs;
  formsAssets?: string;
  clientFactory?: Function;
  templateTextProvider?: Provider;
  /**
   * Provides configurations that are used by the module during API requests
   */
  requests?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
  /**
   * submitRequest is deprecated and will be removed in future releases. use
   * `requests` option instead
   *
   * @deprecated v0.15.15
   */
  submitRequest?: {
    interceptorFactory?: InterceptorFactory<HTTPRequest>;
  };
  loadFormsHandler?: LoadFormsRequestHandler;
};

/** @deprecated Use `FORM_DIRECTIVES` in your module or component `imports` to register or use exported directives */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartFormGroupComponent,
    NgxSmartFormGroupHeaderPipe,
    CloseButtonComponent,
    AddButtonComponent,
    SafeHTMLPipe,
    HasChildrenPipe,
    IsRepeatablePipe,
    IsHiddenPipe,
    NgxSmartFormControlArrayComponent,
    NgxSmartFormControlArrayChildComponent,
    NgxSmartFormArrayComponent,
    NgxSmartFormArrayChildComponent,
    NgxSmartFormComponent,
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
  /** @deprecated Use `provideFormsLoader(...)`, provideFormsHost(...), `provideFormsInitialization(...)`, `provideHttpClient(...)` to register various required services */
  static forRoot(configs: ConfigType): ModuleWithProviders<NgxSmartFormModule> {
    let {
      formsAssets: assets,
      loadFormsHandler,
      serverConfigs,
      requests,
      submitRequest,
    } = configs;
    const _assets = assets ?? '/assets/resources/app-forms.json';

    const providers: Provider[] = [
      provideFormsLoader(loadFormsHandler),
      provideFormsHost(serverConfigs?.api.host ?? undefined),
      provideFormsInitialization(_assets),
      provideHttpClient(
        serverConfigs?.api.host,
        requests?.interceptorFactory ?? submitRequest?.interceptorFactory
      ),
    ];
    return {
      ngModule: NgxSmartFormModule,
      providers: providers,
    };
  }
}
