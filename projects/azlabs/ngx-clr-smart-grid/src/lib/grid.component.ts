import { ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output, TemplateRef, signal as createSignal } from '@angular/core';
import { ClrDatagridModule, ClrDatagridSortOrder, selectionTypeAttribute } from '@clr/angular';
import { PaginateResult, ProjectPaginateQueryParamType, GridColumnType, GridConfigType, DatagridColumnType } from './core';
import { AsyncPipe, CurrencyPipe, DecimalPipe, JsonPipe, LowerCasePipe, PercentPipe, SlicePipe, UpperCasePipe } from '@angular/common';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';
import { CommonModule } from '@angular/common';
import { PIPES } from './pipes';

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
  selectionType: selectionTypeAttribute('none'),
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
    ClrDatagridModule,
    CommonModule,
    ...COMMON_PIPES,
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

  public readonly defaultSort = ClrDatagridSortOrder.DESC;
  protected signal = createSignal<StateType>({
    data: [] as { [index: string]: any }[],
    total: 0 as number,
  });

  @Input() set pageResult(result: PaginateResult<any> | undefined | null) {
    if (result) {
      this.signal.update((state) => ({ ...state, data: result.data ?? [], total: result.total ?? result.data.length }));
    }
  }
  @Input() set data(values: { [index: string]: any }[]) {
    this.signal.update((state) => ({ ...state, data: values }));
  }
  @Input() set total(total: number) {
    this.signal.update((state) => ({ ...state, total }));
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
  @Input({ alias: 'columns', required: true }) set setColumns(values: GridColumnType[]) {
    this._columns = values.map((column) =>
    ({
      ...column,
      field: column.field ?? '',
      style: column.style
        ? {
          class: Array.isArray(column.style.class) ? column.style.class.join(' ') : column.style.class || '',
          styles: Array.isArray(column.style.styles) ? column.style.styles.join(' ') : column.style.styles || '',
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
    })
    ) as Required<DatagridColumnType>[];
  }
  get columns() {
    return this._columns;
  }

  @ContentChild('dgActionOverflow', { static: false }) dgoverflow!: TemplateRef<any>;
  @ContentChild('dgRowDetail', { static: false }) dgrowdetail!: TemplateRef<any>;
  @ContentChild('dgPlaceholder', { static: false }) dgplaceholder!: TemplateRef<any>;
  @ContentChild('dgDetailBody', { static: false }) dgdetail!: TemplateRef<any>;
  @ContentChild('dgActionBar', { static: false }) dgactionbar!: TemplateRef<any>;
  @ContentChild('dgRow', { static: false }) dgrow!: Optional<TemplateRef<any>>;

  @ContentChild('title', { static: false }) title: Optional<TemplateRef<any>>;
  @ContentChild('cell', { static: false }) cell: Optional<TemplateRef<any>>;

  @Output() selectedChange = new EventEmitter<unknown[] | unknown>();
  @Output() dgRefresh = new EventEmitter<ProjectPaginateQueryParamType<unknown>>();
  @Output() detailChange = new EventEmitter<unknown>();
  @Output() dgItemClick = new EventEmitter<unknown>();

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

}
