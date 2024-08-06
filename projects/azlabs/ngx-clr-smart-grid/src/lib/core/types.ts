import { ClrDatagridComparatorInterface } from '@clr/angular';

/** @internal Supported pipe transform type */
export type PipeTransformType = string | ((value: any) => any) | undefined;

/** @description Comparator function type declaration */
export type Comparator<T> =
  | {
      compare: (a: T, b: T) => number;
    }
  | ClrDatagridComparatorInterface<unknown>;

/** @internal */
type BaseGridColumnType = {
  title: string;
  transformTitle?: PipeTransformType | PipeTransformType[];
  transform?: PipeTransformType | PipeTransformType[];
  style?: {
    class?: string | string[];
    styles?: string[] | string;
  };
  type?: 'string' | 'number';
  field?: string;
  /** @description Comparator function when sorting datagrid items */
  sort?: Comparator<unknown> | string | undefined;
  /** @description The sortable property makes the column available for sorting */
  sortable?: boolean;
  /** @description Property name used during sort queries */
  sortPropertyName?: string;
};

/** @deprecated Legacy grid column configuration type declaration */
export type LegacyGridColumnType = BaseGridColumnType & {
  /** @deprecated Use `property` instead */
  label: string;
};

/** 
 * @description new datagrid API column type definition
 * @internal
 */
export type DatagridColumnType = BaseGridColumnType & { property: string };

/** @description Type definition of a smart grid column. It represents each column of the smart grid */
export type GridColumnType = LegacyGridColumnType | DatagridColumnType;

/** @description Type declaration for a grid column type with added searchable property */
export type SearchableGridColumnType = GridColumnType &
  (
    | {
        searcheable?: true;
        search?: {
          type?: 'text' | 'date';
          /**
           * Flexible property is use allow grid to control the operator use when performing
           * search. Case the search flexibility is true, an `or` query is send to the server
           * else an `and` query is send to the server
           */
          flexible: boolean;
        };
      }
    | { searcheable?: false }
  );

/** @description Type definition of Smart datagrid configuration value. */
export type GridConfigType = {
  transformColumnTitle?: PipeTransformType | PipeTransformType[];
  capitalizeColumnTitle?: boolean;
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
  columnHeadersClass?: string | string[];
};

/** @description Grid select directive input type declaration */
export type GriSelectDirectiveInputType = {
  selectable: boolean;
  singleSelection: boolean;
};

/** @description Datagrid Detail columns type declaration */
export type GridDetailColumnType = {
  title: string;
  property: string;
  titleTransform?: PipeTransformType | PipeTransformType[];
  transform?: PipeTransformType | PipeTransformType[];
  style?: {
    cssClass?: string | string[];
    styles?: string[] | Record<string, boolean>;
  };
};

/** @description List of columns type declaration */
export type GridDetailColumnTypes = GridDetailColumnType[];

// #region Pagination type declarations
/** @description Paginate query result type definition */
export type PaginateResult<T> = {
  total?: number;
  data: T[];
  lastPage?: number;
  nextPageURL?: string;
  lastPageURL?: string;
  page?: number;
};

/** @description paginate result single item type definition. To make it easy for developpers for identify paginate result items */
export type PaginateItem = { id: string | number } & Record<string, unknown>;

/** @description Project query function query filters type */
export type QueryFiltersType = { [index: string]: any }[];

/** @description Parameter type for projectPaginateQuery() query function */
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

/** @description projectPaginateQuery() query function output type */
export type ProjectPaginateQueryOutputType = {
  page: number;
  per_page: number | undefined;
  _query: string | object;
  [index: string]: any;
};
// #endregion Pagination type declarations
