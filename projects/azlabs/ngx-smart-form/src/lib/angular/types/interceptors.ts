import { Injector } from "@angular/core";
import { Interceptor } from "@azlabsjs/requests";

export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;
