import { InjectionToken } from '@angular/core';
import { Translations } from './types';

export const TRANSLATIONS_DICTIONARY = new InjectionToken<Translations>(
  'TRANSLATIONS DICTIONARY PROVIDER'
);
