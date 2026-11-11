import { InjectionToken } from "@angular/core";
import { RequestClient } from "./types";


/** HTTP requests client injection token */
export const HTTP_REQUEST_CLIENT = new InjectionToken<RequestClient>('HTTP requests client injection token');