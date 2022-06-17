import { InputInterface } from '../types';

// @internal
export interface InputGroup extends InputInterface {
  children: InputInterface[];
}
