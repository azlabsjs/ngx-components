import { ClrDatagridComparatorInterface } from '@clr/angular';

export type Comparator<T> =
  | {
      compare: (a: T, b: T) => number;
    }
  | ClrDatagridComparatorInterface<unknown>;

/**
 * Type definition of a smart grid column.
 * It represents each column of the smart grid
 */
export type GridColumnType = {
  title: string;
  label: string;
  transform?: string | ((state: unknown) => unknown) | undefined;
  style?: {
    class?: string | string[];
    styles?: string[] | string;
  };
  type?: 'string' | 'number';
  field?: string;
  sort?: Comparator<unknown> | undefined;
  /**
   * The sortable property makes the column available for sorting
   */
  sortable?: boolean;
  /**
   * Property name used during sort queries
   * 
   */
  sortPropertyName?: string;
};

/**
 * Type definition of Smart datagrid configuration value.
 */
export type GridConfigType = {
  selectable: boolean;
  class: string;
  sizeOptions: number[];
  pageSize: number;
  selectableProp: string;
  preserveSelection: boolean;
  singleSelection: boolean;
  hasActionOverflow: boolean;
  hasDetails: boolean;
  hasExpandableRows: boolean;
  useServerPagination: boolean;
  useCustomFilters: boolean;
  totalItemLabel?: string;
  projectRowClass?: string | ((element: any) => string);
};

export type GriSelectDirectiveInputType = {
  selectable: boolean;
  singleSelection: boolean;
};
