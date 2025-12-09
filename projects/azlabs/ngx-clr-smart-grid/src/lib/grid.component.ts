import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ClarityModule, ClrDatagridSortOrder } from '@clr/angular';
import {
  PaginateResult,
  ProjectPaginateQueryParamType,
  GridColumnType,
  GridConfigType,
  DatagridColumnType,
  LegacyGridColumnType,
  remove,
} from './core';
import { CommonModule } from '@angular/common';
import { NgxClrGridSelectDirective } from './directives';
import { PIPES } from './pipes';
import {
  AsyncPipe,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';

/** @internal */
const GRID_CONFIG: Required<GridConfigType> = {
  transformColumnTitle: 'default',
  capitalizeColumnTitle: false,
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

/** @internal */
type StateType = {
  data: { [index: string]: any }[];
  total: number;
};

/** @internal */
type Optional<T> = T | null | undefined;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ClarityModule,
    ...COMMON_PIPES,
    NgxClrGridSelectDirective,
    ...PIPES,
  ],
  providers: [
    UpperCasePipe,
    LowerCasePipe,
    CurrencyPipe,
    DecimalPipe,
    JsonPipe,
    PercentPipe,
    SlicePipe,
    AsyncPipe,
    ...COMMON_PIPES,
  ],
  selector: 'ngx-clr-smart-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxClrSmartGridComponent {
  //#region local properties
  public readonly defaultSort = ClrDatagridSortOrder.DESC;
  _state: StateType = {
    data: [] as { [index: string]: any }[],
    total: 0 as number,
  };

  get state() {
    return this._state;
  }
  //#endregion

  // #region input properties
  @Input() set pageResult(result: PaginateResult<any> | undefined | null) {
    if (result) {
      this.setState((state) => ({
        ...state,
        data: result.data ?? [],
        total: result.total ?? result.data.length,
      }));
    }
  }
  @Input() set data(values: { [index: string]: any }[]) {
    this.setState((state) => ({ ...state, data: values }));
  }
  @Input() set total(total: number) {
    this.setState((state) => ({ ...state, total }));
  }
  @Input() selected!: unknown[] | any;
  @Input() loading: boolean = false;
  @Input() placeholder!: string | undefined | null;
  @Input({
    required: true,
    transform: (value: Partial<GridConfigType>) => ({
      ...GRID_CONFIG,
      ...value,
    }),
  })
  config: Required<GridConfigType> = GRID_CONFIG;
  private _columns: Required<DatagridColumnType>[] = [];
  @Input({ alias: 'columns', required: true }) set setColumns(
    values: GridColumnType[]
  ) {
    this._columns = values.map((column) =>
      remove(
        {
          ...column,
          label: (column as LegacyGridColumnType).label,
          property:
            (column as DatagridColumnType).property ??
            (column as LegacyGridColumnType).label,
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
          type: column.type ?? 'string',
          transform: column.transform || 'default',
          sort: column.sort ?? {
            compare: (a: unknown, b: unknown) => {
              return Number(ClrDatagridSortOrder.DESC);
            },
          },
          sortable: column.sortable ?? true,
        },
        'label'
      )
    ) as Required<DatagridColumnType>[];
  }
  get columns() {
    return this._columns;
  }
  //#endregion

  @ContentChild('dgActionOverflow', { static: false })
  dgoverflow!: TemplateRef<any>;
  @ContentChild('dgRowDetail', { static: false })
  dgrowdetail!: TemplateRef<any>;
  @ContentChild('dgPlaceholder', { static: false })
  dgplaceholder!: TemplateRef<any>;
  @ContentChild('dgDetailBody', { static: false })
  dgdetail!: TemplateRef<any>;
  @ContentChild('dgActionBar', { static: false })
  dgactionbar!: TemplateRef<any>;
  @ContentChild('dgRow', { static: false })
  dgrow!: Optional<TemplateRef<any>>;

  // title & cell customization templates
  @ContentChild('title', { static: false }) title: Optional<TemplateRef<any>>;
  @ContentChild('cell', { static: false }) cell: Optional<TemplateRef<any>>;

  // #region output properties
  @Output() selectedChange = new EventEmitter<unknown[] | unknown>();
  @Output() dgRefresh = new EventEmitter<
    ProjectPaginateQueryParamType<unknown>
  >();
  @Output() detailChange = new EventEmitter<unknown>();
  @Output() dgItemClick = new EventEmitter<unknown>();
  // #endregion

  /** @description smart grid class constructor */
  constructor(private cdRef: ChangeDetectorRef) {}

  // listen to internal grid component select changes and notify parent component
  onSelectedStateChanges(state: unknown[] | unknown) {
    this.selectedChange.emit(state);
  }

  onDgRefresh(e: ProjectPaginateQueryParamType) {
    this.dgRefresh.emit(e);
  }

  onItemClick(event: Event, item: unknown) {
    this.dgItemClick.emit(item);
    event?.preventDefault();
  }

  /** @deprecated */
  onClrDgRefresh(e: ProjectPaginateQueryParamType) {
    this.onDgRefresh(e);
  }

  /** @deprecated */
  onClrItemClick(e: Event, item: unknown) {
    this.onItemClick(e, item);
  }

  /** @description update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
