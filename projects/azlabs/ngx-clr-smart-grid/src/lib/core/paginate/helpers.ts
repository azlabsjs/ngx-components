import { JSDate } from '@azlabsjs/js-datetime';
import {
  ProjectPaginateQueryOutputType,
  ProjectPaginateQueryParamType,
  QueryFiltersType
} from './types';

/**
 * Query operators supported
 */
const QUERY_OPERATORS = ['>=', '<=', '<', '>', '<>', '=like', '=='];

/**
 * For query parameters composed of &&:, and:, etc... operators, we trim the operators
 * from the parameter which will be apply to the value of the parameter
 *
 * @param key
 */
function prepareComposedQueryKey(key: string): [string, string | undefined] {
  let prefix!: string | undefined;
  // First we remove any formatter from the query parameter name
  // before proceeding to trimming operators from the parameter name
  if (typeof key === 'undefined' || key === null) {
    return [key, prefix];
  }
  if (key.startsWith('date:')) {
    key = key.substring('date:'.length);
  }
  for (const operator of QUERY_OPERATORS) {
    if (key.startsWith(`&&:${operator}:`)) {
      prefix = `&&:${operator}:`;
      key = key.substring(`&&:${operator}:`.length);
      break;
    }
  }
  if (typeof prefix !== 'undefined' && prefix !== null) {
    return [key, prefix];
  }
  if (key.startsWith('&&:')) {
    key = key.substring('&&:'.length);
    prefix = '&&:';
  } else if (key.startsWith('and:')) {
    key = key.substring('and:'.length);
    prefix = 'and:';
  }
  return [key, prefix];
}

/**
 * Creates a date query parameter piping function that format the date value using the input format
 * into a date formatted as 'YYYY-MM-DD' supported by most backend services or databases
 *
 * @param format
 */
export function createDateQueryParamPipe(format: string = 'DD/MM/YYYY') {
  const toWebServiceDateFormat = (value: string) => {
    const newDate = JSDate.create(value as string, format);
    const result = JSDate.format(newDate, 'YYYY-MM-DD');
    return /(Invalid|DatenvalInvalid)/.test(result as string) ? value : result;
  };
  const parseQueryDate = (value: string) => {
    const _value = /[\w\/]{1,}(([ \t])?-([ \t])?)[\w\/]{1,}/.test(value)
      ? value.split('|')
      : value;
    if (Array.isArray(_value)) {
      const after = toWebServiceDateFormat(_value[0]);
      const before = toWebServiceDateFormat(_value[1]);
      return `>=:${after}|&&:<=:${before}`;
    }
    return toWebServiceDateFormat(_value as string);
  };
  const decoratedCallback: (
    key: string,
    value: unknown
  ) => [string, unknown] = (key: string, value: unknown) => {
    if (key && key.startsWith('date:')) {
      key = key.substring('date:'.length);
      const _value = Array.isArray(value) ? value[0] : (value as string);
      value = parseQueryDate(_value);
      return [key, value];
    }
    return [key, value] as [string, unknown];
  };
  return decoratedCallback;
}

/**
 * Transformation function that takes in frameworks specific pagination
 * configuration and attempts to build a server query object.
 *
 * It was build taking into account Clarity datagrid paginator output during
 * refresh events
 *
 * @example
 * ```ts
 * const state = projectPaginateQuery([{name: 'John', lastname: 'Doe'}])({
 *    page: {
 *      from: 1,
 *      to: 10,
 *      size: 15
 *    },
 *    filters: [
 *        { age: 15}
 *    ]
 * })
 * ```
 */
export function projectPaginateQuery<T>(
  filters: QueryFiltersType = [],
  filtersPipe?: (key: string, value: unknown) => [string, unknown]
) {
  return (state: Partial<ProjectPaginateQueryParamType<T>>) => {
    let query: { [prop: string]: any } = {};
    if (state.filters) {
      for (let filter of state.filters) {
        if (
          typeof filter === 'object' &&
          !(filter as Object).hasOwnProperty('property')
        ) {
          const keys = Object.keys(filter);
          if (keys.length > 1) {
            continue;
          }
          filter = { property: keys[0], value: filter[keys[0]] };
        }
        let { property, value } = filter;
        if (typeof property === 'undefined' || property === null) {
          continue;
        }
        const _filtersPipe =
          filtersPipe ??
          ((__key: string, __value?: unknown) => {
            return [__key, __value];
          });
        let [key, result] = _filtersPipe(property, value);
        const [_key, prefix] = prepareComposedQueryKey(key);
        query[_key] = [prefix ? `${prefix}${result}` : result];
      }
    }
    //#region Add sort filters to the list of query filters
    let order = 'DESC';
    let by = 'updated_at';
    if (state?.sort) {
      [by] =
        state?.sort?.by && typeof state?.sort?.by === 'string'
          ? prepareComposedQueryKey(state?.sort?.by as string)
          : ['updated_at'];
      order = state?.sort?.reverse ? 'DESC' : 'ASC';
    }
    query = {
      ...query,
      _query: JSON.stringify({
        orderBy: { order, by },
      }),
    };
    //#endregion Add sort filters to the list of query filters
    let queryState = {
      ...query,
      page: state?.page?.current ?? 1,
      per_page: state?.page?.size ?? 20,
    };
    if (Array.isArray(filters)) {
      filters.map((p: object) => {
        queryState = { ...queryState, ...p };
      });
    }
    return queryState as ProjectPaginateQueryOutputType;
  };
}
