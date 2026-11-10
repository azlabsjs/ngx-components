import { InjectionToken } from '@angular/core';
import { TranslationsType } from './types';
import { Observable } from 'rxjs';

export const COMMON_STRINGS = new InjectionToken<Observable<TranslationsType>>('translations provider Token');
