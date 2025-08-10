import { FetchOptionsDirective } from './options.directive';
export { FetchOptionsDirective } from './options.directive';
export { NgxOptionsInputModule } from './options.module';
export { INPUT_OPTIONS_CLIENT, OPTIONS_CACHE } from './tokens';
export {
  InputOptionsClient,
  OptionsQueryConfigType,
  InterceptorFactory,
} from './types';

export { optionsQueryClient } from './helpers';

/** exported library providers */
export { provideCacheConfig, provideQueryClient } from './providers';

/** exported directives */
export const OPTIONS_DIRECTIVES = [FetchOptionsDirective] as const;
