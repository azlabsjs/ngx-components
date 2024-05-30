import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { JSObject } from '@azlabsjs/js-object';
import { ClarityModule, ClrDatagridSortOrder } from '@clr/angular';
import {
  PaginateResult,
  ProjectPaginateQueryParamType,
  GridColumnType,
  GridConfigType,
  PipeTransformType,
} from './core';
import { CommonModule } from '@angular/common';
import { NgxCommonModule } from '@azlabsjs/ngx-common';
import { NgxClrGridSelectDirective } from './directives';

/** @internal */
type ColumnType = Omit<
  Required<GridColumnType>,
  'sortPropertyName' | 'transformTitle'
> & {
  sortPropertyName?: string;
  transformTitle?: PipeTransformType | PipeTransformType[];
};

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ClarityModule,
    NgxCommonModule,
    NgxClrGridSelectDirective,
  ],
  selector: 'ngx-clr-smart-grid',
  templateUrl: './grid.component.html',
  styles: [
    `
      .cell-value {
        display: inline-block;
      }
    `,
  ],
})
export class NgxClrSmartGridComponent {
  // #region Input properties
  @Input() set pageResult(result: PaginateResult<any> | undefined | null) {
    if (result) {
      this.data = result.data ?? [];
      this.total = result.total ?? this.data.length;
    }
  }
  @Input() selected!: unknown[] | any;
  @Input() data: { [index: string]: any }[] = [];
  @Input() loading: boolean = false;
  @Input() currentDetail!: unknown;
  @Input() total!: number;
  @Input() placeholder!: string | undefined | null;
  // #endregion Input properties

  // Projected Templates
  @ContentChild('dgActionOverflow', { static: false })
  dgActionOverflowRef!: TemplateRef<any>;
  @ContentChild('dgRowDetail', { static: false })
  dgRowDetailRef!: TemplateRef<any>;
  @ContentChild('dgPlaceHolder', { static: false })
  dgPlaceHolderRef!: TemplateRef<any>;
  @ContentChild('dgDetailBody', { static: false })
  dgDetailBodyRef!: TemplateRef<any>;
  @ContentChild('dgActionBar', { static: false })
  dgActionBarRef!: TemplateRef<any>;
  @ContentChild('dgRow', { static: false })
  dgRowRef!: TemplateRef<any>;
  //! Projected Templates

  // Datagrid configuration Input
  private _config: Required<GridConfigType> = {
    transformColumnTitle: 'default',
    selectable: false,
    class: '',
    sizeOptions: [20, 50, 100, 150],
    pageSize: 20,
    selectableProp: '',
    preserveSelection: false,
    singleSelection: false,
    hasActionOverflow: false,
    hasDetails: false,
    hasExpandableRows: false,
    useServerPagination: false,
    useCustomFilters: false,
    totalItemLabel: 'Total',
    projectRowClass: '',
    columnHeadersClass: '',
  };
  @Input() set config(value: Partial<GridConfigType>) {
    if (value) {
      const { _config } = this;
      this._config = { ..._config, ...value };
    }
  }
  public get config(): Required<GridConfigType> {
    return this._config;
  }
  //! Datagrid configuration Input

  // Datagrid columns configuraiton inputs
  private _columns: ColumnType[] = [];
  @Input() set columns(values: GridColumnType[]) {
    if (values) {
      // Map input value to typeof Required<GridColumn>
      // type definitions
      this._columns = values.map((column) => ({
        ...column,
        field: column.field ?? '',
        style: column.style
          ? {
              class: Array.isArray(column.style.class)
                ? column.style.class.join(' ')
                : column.style.class || '',
              styles: Array.isArray(column.style.styles)
                ? column.style.styles.join(' ')
                : column.style.styles || '',
            }
          : {},
        type: column.type || 'string',
        transform: column.transform || 'default',
        sort: column.sort || {
          compare: (a: unknown, b: unknown) => {
            return Number(ClrDatagridSortOrder.DESC);
          },
        },
        sortable: column.sortable ?? true,
      }));
    }
  }
  get columns(): ColumnType[] {
    return this._columns;
  }
  //! Datagrid columns configuraiton inputs

  public readonly defaultSort = ClrDatagridSortOrder.DESC;

  // #region Component outputs
  @Output() selectedChange = new EventEmitter<unknown[] | unknown>();
  @Output() dgRefresh = new EventEmitter<
    ProjectPaginateQueryParamType<unknown>
  >();
  @Output() detailChange = new EventEmitter<unknown>();
  @Output() dgItemClick = new EventEmitter<unknown>();
  // #endregion Component outputs

  // Listen to internal grid component select changes and notify parent component
  onSelectedStateChanges(state: unknown[] | unknown) {
    this.selectedChange.emit(state);
  }

  getCellValue(element: Record<string, any>, key: string) {
    return JSObject.getProperty(element, key) ?? '';
  }

  getrowclass(config: GridConfigType, current: { [index: string]: any }) {
    return config && config.projectRowClass
      ? typeof config.projectRowClass === 'function'
        ? config.projectRowClass(current)
        : config.projectRowClass
      : '';
  }

  onClrDgRefresh(event: ProjectPaginateQueryParamType) {
    this.dgRefresh.emit(event);
  }

  onClrItemClick(event: Event, item: unknown) {
    this.dgItemClick.emit(item);
    event?.preventDefault();
  }
}
