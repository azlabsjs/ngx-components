import { ModuleWithProviders, NgModule } from '@angular/core';
import { FetchOptionsDirective } from './options.directive';
import { OptionsQueryConfigType } from './types';
import { provideCacheConfig, provideQueryClient } from './providers';

/** @deprecated */
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

/** @deprecated */
@NgModule({
  declarations: [],
  imports: [FetchOptionsDirective],
  exports: [FetchOptionsDirective],
})
export class NgxOptionsInputModule {
  /** @deprecated Use exported `provideCacheConfig(...)`, `provideQueryClient(...)` to register global providers */
  static forRoot(
    configs: ConfigType
  ): ModuleWithProviders<NgxOptionsInputModule> {
    return {
      ngModule: NgxOptionsInputModule,
      providers: [
        provideCacheConfig(configs.cacheTTL, configs.refreshInterval),
        provideQueryClient(configs.optionsRequest, configs.host),
      ],
    };
  }
}
