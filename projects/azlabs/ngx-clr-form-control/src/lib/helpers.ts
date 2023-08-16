import { Injector } from '@angular/core';
import { HTTPRequest, HTTPResponse, NextFunction } from '@azlabsjs/requests';

/**
 * Checks if a given value is a promise value
 *
 * @internal
 */
function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Promise<unknown>).then === 'function'
  );
}

/**
 * Provide a default interceptor function that resolves selectable values using `data` keyword if it exist
 * in the response body or return the entire response body if the data object does not exists
 */
export function useOptionsInterceptor(
  cloneReq?: (
    request: HTTPRequest,
    injector: Injector
  ) => HTTPRequest | Promise<HTTPRequest>
) {
  return (injector: Injector) => {
    // Replace the interceptor function by using the injector
    return async (
      request: HTTPRequest,
      next: NextFunction<
        HTTPRequest,
        HTTPResponse | Promise<HTTPResponse> | Promise<unknown> | unknown
      >
    ) => {
      const _cloneReq = cloneReq ?? ((request) => request);
      const _req = _cloneReq(request, injector);
      const _request = await (isPromise(_req) ? _req : Promise.resolve(_req));
      const response = await (next(_request) as Promise<HTTPResponse>);
      return response.clone({
        setBody: (body: Record<string, unknown>) => {
          if (typeof body === 'undefined' || body === null) {
            return [];
          }
          return body['data'] ?? body;
        },
      });
    };
  };
}
