import { InjectionToken } from '@angular/core';
import { InputOptionsClient } from '@azlabsjs/smart-form-core';

export const INPUT_OPTIONS_CLIENT = new InjectionToken<
  InputOptionsClient | InputOptionsClient
>('CLIENT PROVIDER FOR OPTIONS INPUT');
