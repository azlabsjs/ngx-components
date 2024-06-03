import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  signal,
} from '@angular/core';
import { ClarityModule, ClrDatagridSortOrder } from '@clr/angular';
import {
  PaginateResult,
  ProjectPaginateQueryParamType,
  GridColumnType,
  GridConfigType,
} from './core';
import { CommonModule } from '@angular/common';
import { NgxClrGridSelectDirective } from './directives';
import { GridRowClassPipe } from './pipes';
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

const GRID_CONFIG: Required<GridConfigType> = {
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

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ClarityModule,
    ...COMMON_PIPES,
    NgxClrGridSelectDirective,
    GridRowClassPipe,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxClrSmartGridComponent {
  //#region Component properties
  public readonly defaultSort = ClrDatagridSortOrder.DESC;
  state = signal({
    data: [] as { [index: string]: any }[],
    total: 0 as number,
  });
  //#endregion Component properties

  // #region Component inputs
  @Input() set pageResult(result: PaginateResult<any> | undefined | null) {
    if (result) {
      this.state.update((state) => ({
        ...state,
        data: result.data ?? [],
        total: result.total ?? result.data.length,
      }));
    }
  }
  @Input() set data(values: { [index: string]: any }[]) {
    this.state.update((state) => ({ ...state, data: values }));
  }
  @Input() set total(total: number) {
    this.state.update((state) => ({ ...state, total }));
  }
  @Input() selected!: unknown[] | any;
  @Input() loading: boolean = false;
  @Input() currentDetail!: unknown;
  @Input() placeholder!: string | undefined | null;
  @Input({
    required: true,
    transform: (value: Partial<GridConfigType>) => ({
      ...GRID_CONFIG,
      ...value,
    }),
  })
  config: Required<GridConfigType> = GRID_CONFIG;
  @Input({
    required: true,
    transform: (values: GridColumnType[]) =>
      values.map((column) => ({
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
      })),
  })
  columns: Required<GridColumnType>[] = [];
  //#endregion Component inputs

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
}
