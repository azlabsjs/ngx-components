import { HTTPRequest } from "@azlabsjs/requests";
import { HTTP_REQUEST_CLIENT } from "./tokens";
import { InterceptorFactory } from "./types";
import { createRequestClient } from "./client";
import { inject, Injector } from "@angular/core";

/** @description provides an http or request client used when submit forms or form component is sending requests */
export function provideHttpClient(host?: string, interceptor?: InterceptorFactory<HTTPRequest>) {
    return {
        provide: HTTP_REQUEST_CLIENT,
        useFactory: () => createRequestClient(inject(Injector), host, interceptor),
        deps: [],
    };
}
