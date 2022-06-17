import { ObservableInput } from 'rxjs';

export type HTTPStatefulMethod = 'POST' | 'PUT' | 'PATH';
export type HTTPRequestMethods =
  | 'GET'
  | 'DELETE'
  | 'OPTION'
  | 'HEAD'
  | HTTPStatefulMethod;
export type HTTPResponseType = 'text' | 'blob' | 'array' | 'json';

export interface RequestClient {
  /**
   * Makes an HTTP Request to a server enpoint and returns
   * an observable of response type
   *
   * @param path The path to API resource or full server url
   * @param method
   * @param body
   * @param options
   */
  request<T>(
    path: string,
    method: HTTPStatefulMethod,
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
    }
  ): ObservableInput<T>;
}

// TODO: Add a REST CLIENT interface with methods like get(), post(), put(), delete(), path(), options(), head(), etc...
