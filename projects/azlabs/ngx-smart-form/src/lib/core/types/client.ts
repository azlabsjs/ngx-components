import { Observable } from 'rxjs';
import { OptionsInputItemsInterface } from './items';

export interface SelectOptionsClient {
  //
  /**
   * @description Query list of select options from forms provider database
   *
   */
  request(params: string | any[]): Observable<OptionsInputItemsInterface>;
}
