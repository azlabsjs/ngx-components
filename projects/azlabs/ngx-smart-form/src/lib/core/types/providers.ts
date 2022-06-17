import { Observable } from "rxjs";
import { FormInterface } from "../compact";

/**
 * @description Provide implementation for preloading application form
 * into developper defined cache
 */
export interface FormsLoader {
  /**
   * @descritpion Provides an abstraction for loading dynamic form definitions
   * from an asset configuration file, a remote server
   *
   * @param endpoint
   * @param options
   */
  load(
    endpoint: string,
    options?: { [index: string]: any }
  ): Observable<FormInterface[]>;
}

/**
 * @description Forms cache provider. For form object query efficiency, object are loaded
 * and managed by the cache provider
 */
export interface CacheProvider {

  /**
   *
   * @param id
   */
  get(id: string|number): Observable<FormInterface>;

  /**
   *
   * @param values
   */
  getList(values: (string|number)[]): Observable<FormInterface[]>;

  /**
   * Provides predefined dynamic forms loader implementation
   *
   * @param endpoint
   * @param options
   */
  cache(
    endpoint: string,
    options?: { [index: string]: any }
  ): Observable<never> | Observable<FormInterface[]>;
}
