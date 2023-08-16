import { ClrDatagridComparatorInterface } from '@clr/angular';

/**
 * @internal
 *
 * Supported pipe transform type
 */
export type PipeTransformType =
  | string
  | ((value: unknown) => unknown)
  | undefined;

/**
 * Comparator function type declaration
 */
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
  transformTitle?: PipeTransformType | PipeTransformType[];
  transform?: PipeTransformType | PipeTransformType[];
  style?: {
    class?: string | string[];
    styles?: string[] | string;
  };
  type?: 'string' | 'number';
  field?: string;
  /**
   * Comparator function when sorting datagrid items
   */
  sort?: Comparator<unknown> | string | undefined;
  /**
   * The sortable property makes the column available for sorting
   */
  sortable?: boolean;
  /**
   * Property name used during sort queries
   */
  sortPropertyName?: string;
};

/**
 * Type definition of Smart datagrid configuration value.
 */
export type GridConfigType = {
  transformColumnTitle?: PipeTransformType | PipeTransformType[];
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


// #region Pagination type declarations
/**
 * Paginate query result type definition
 */
export type PaginateResult<T> = {
  total?: number;
  data: T[];
  lastPage?: number;
  nextPageURL?: string;
  lastPageURL?: string;
  page?: number;
};

/**
 * paginate result single item type definition. To make it easy for developpers
 * for identify paginate result items
 */
export type PaginateItem = { id: string | number } & Record<string, unknown>;

/**
 * Project query function query filters type
 */
export type QueryFiltersType = { [index: string]: any }[];

/**
 * Parameter type for projectPaginateQuery() query function
 */
export type ProjectPaginateQueryParamType<T = any> = {
  page?: {
    from?: number;
    to?: number;
    size?: number;
    current?: number;
  };
  sort?: {
    by: string | { compare: (a: T, b: T) => number };
    reverse: boolean;
  };
  filters?: any[];
};

/**
 * projectPaginateQuery() query function output type
 */
export type ProjectPaginateQueryOutputType = {
  page: number;
  per_page: number | undefined;
  _query: string | object;
  [index: string]: any;
};
// #endregion Pagination type declarations