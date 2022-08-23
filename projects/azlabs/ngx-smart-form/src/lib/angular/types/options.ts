import {
  InputOptionsInterface,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { Observable } from 'rxjs';

export interface InputOptionsClient {
  //
  /**
   * @description Query list of select options from forms provider database
   *
   */
  request(optionsConfig: OptionsConfig): Observable<InputOptionsInterface>;
}
