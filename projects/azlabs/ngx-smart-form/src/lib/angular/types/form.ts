import { FormConfigInterface, FormInterface } from '@azlabsjs/smart-form-core';
import { Observable } from 'rxjs';

/**
 * @description Form client type definition. Implementation class must provide
 * functionality to load the form using form id from a given data source
 */
export interface FormsClient {
  /**
   * @description Get form definitions using the user provided id
   * @param id
   */
  get(id: string | number): Observable<FormConfigInterface>;

  /**
   * @description Get form definitions using the list of user provided ids
   * @param id
   */
  getAll(id: string[] | number[]): Observable<FormConfigInterface[]>;
}

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
  get(id: string | number): Observable<FormInterface>;

  /**
   *
   * @param values
   */
  getList(values: (string | number)[]): Observable<FormInterface[]>;

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

/**
 * @internal
 * 
 * Internal type definition for load form request handler function
 */
export type LoadFormsRequestHandler = (
  path: string,
  options?: Record<string, unknown>
) => Observable<Record<string, unknown>[]>;
