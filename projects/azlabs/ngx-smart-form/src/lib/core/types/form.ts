import { InputConfigInterface } from './input';
import { Observable } from 'rxjs';

export interface FormConfigInterface {
  id: number | string;
  title: string;
  description?: string;
  controlConfigs: InputConfigInterface[];
  endpointURL?: string;
  appcontext?: string;
}

/**
 * @description Form client type definition. Implementation class must provide
 * functionality to load the form using form id from a given data source
 */
export interface FormsClient {
  /**
   * @description Get form definitions using the user provided id
   * @param id
   */
  get(id: string | number): Observable<FormConfigInterface>;

  /**
   * @description Get form definitions using the list of user provided ids
   * @param id
   */
  getAll(id: string[] | number[]): Observable<FormConfigInterface[]>;
}
