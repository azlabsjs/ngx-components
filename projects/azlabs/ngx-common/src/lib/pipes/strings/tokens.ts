import { InjectionToken } from '@angular/core';
import { CommonStringsType } from './types';
import { Observable } from 'rxjs';

/** @description Common strings provider injection token */
export const COMMON_STRINGS = new InjectionToken<Observable<CommonStringsType>>(
  'Common Strings Provider Token'
);
