import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { FetchOptionsDirective } from './fetch-options.directive';
import { INPUT_OPTIONS_CLIENT, OPTIONS_CACHE } from './tokens';
import { optionsQueryClient } from './query-factory';
import { OptionsQueryConfigType } from './types';
import { OptionsCache } from './cache.service';
import { deepEqual } from '@azlabsjs/utilities';

type ConfigType = {
  host?: string;
  optionsRequest: OptionsQueryConfigType;
  /**
   * Number of seconds after which item is automatically refetch
   */
  refreshInterval?: number;
  /**
   * Number of seconds after which item is no more valid in cache
   */
  cacheTTL?: number;
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
          provide: OPTIONS_CACHE,
          useFactory: () => {
            return new OptionsCache(
              deepEqual,
              configs?.refreshInterval,
              configs.cacheTTL
            );
          },
        },
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
