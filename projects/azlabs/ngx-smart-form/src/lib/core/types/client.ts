import { Observable } from 'rxjs';
import { SelectableControlItems } from './items';

export interface SelectOptionsClient {
  //
  /**
   * @description Query list of select options from forms provider database
   *
   */
  request(params: string | any[]): Observable<SelectableControlItems>;
}
