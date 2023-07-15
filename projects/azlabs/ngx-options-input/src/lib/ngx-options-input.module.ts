import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { FetchOptionsDirective } from './fetch-options.directive';
import { INPUT_OPTIONS_CLIENT } from './tokens';
import { optionsQueryClient } from './query-factory';
import { OptionsQueryConfigType } from './types';

type ConfigType = {
  host?: string;
  optionsRequest: OptionsQueryConfigType;
};

@NgModule({
  declarations: [FetchOptionsDirective],
  imports: [],
  exports: [FetchOptionsDirective],
})
export class NgxOptionsInputModule {
  static forRoot(
    configs: ConfigType
  ): ModuleWithProviders<NgxOptionsInputModule> {
    return {
      ngModule: NgxOptionsInputModule,
      providers: [
        {
          provide: INPUT_OPTIONS_CLIENT,
          useFactory: (injector: Injector) => {
            return optionsQueryClient(
              injector,
              configs.host,
              configs.optionsRequest
            );
          },
          deps: [Injector],
        },
      ],
    };
  }
}
