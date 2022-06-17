import { Control } from './form-control';
import {
  OptionInterface,
  ControlInterface,
  FormInterface,
} from '../compact/types';

export class Form implements FormInterface {
  id!: number;
  title!: string;
  parentId!: string;
  description!: string;
  controls: ControlInterface[] = [];
  url!: string;
  status!: number;
  appcontext!: string;

  public static getJsonableProperties(): {
    [index: string]: keyof Form | { name: string; type: any };
  } {
    return {
      title: 'title',
      parentId: 'parentId',
      description: 'description',
      children: { name: 'children', type: Form },
      controls: { name: 'controls', type: Control },
      url: 'url',
      status: 'status',
      id: 'id',
      appcontext: 'appcontext',
    };
  }
}

export class Option implements OptionInterface {
  id!: number;
  table!: string;
  keyfield!: string;
  groupfield!: string;
  description!: string;
  displayLabel!: string;

  static getJsonableProperties():
    | { [index: string]: keyof Option }
    | { [index: string]: { name: string; type: any } } {
    return {
      id: 'id',
      table: 'table',
      keyfield: 'keyfield',
      groupfield: 'groupfield',
      valuefield: 'description',
      display_label: 'displayLabel',
    };
  }
}
