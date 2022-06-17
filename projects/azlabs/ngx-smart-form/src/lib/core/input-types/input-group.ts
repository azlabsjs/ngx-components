import { InputConfigInterface } from '../types';

// @internal
export interface InputGroup extends InputConfigInterface {
  children: InputConfigInterface[];
}
