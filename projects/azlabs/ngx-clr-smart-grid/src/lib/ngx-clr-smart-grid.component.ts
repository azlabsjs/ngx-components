import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef
} from '@angular/core';
import { JSObject } from '@azlabsjs/js-object';
import { ClrDatagridSortOrder, ClrDatagridStateInterface } from '@clr/angular';
import { GridColumnType, GridConfigType } from './core/types';

@Component({
  selector: 'ngx-clr-smart-grid',
  templateUrl: './ngx-clr-smart-grid.component.html',
  styles: [],
})
export class NgxClrSmartGridComponent {
  // Input properties
  @Input() selected!: unknown[] | any;
  @Input() data: { [index: string]: any }[] = [];
  @Input() loading: boolean = false;
  @Input() currentDetail!: unknown;
  @Input() total!: number;

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
  @ContentChild('dgRow', {static: false})
  dgRowRef!: TemplateRef<any>;
  //! Projected Templates

  // Datagrid configuration Input
  private _config: Required<GridConfigType> = {
    selectable: false,
    class: '',
    sizeOptions: [20, 50, 100, 150],
    pageSize: 50,
    selectableProp: '',
    preserveSelection: false,
    singleSelection: false,
    hasActionOverflow: false,
    hasDetails: false,
    hasExpandableRows: false,
    useServerPagination: false,
    useCustomFilters: false,
    totalItemLabel: 'Total',
  };
  @Input() set config(value: Partial<GridConfigType>) {
    if (value) {
      this._config = {
        ...this._config,
        ...value,
      };
    }
  }
  public get config(): Required<GridConfigType> {
    return this._config;
  }
  //! Datagrid configuration Input

  // Datagrid columns configuraiton inputs
  private _columns: Required<GridColumnType>[] = [];
  @Input() set columns(values: GridColumnType[]) {
    if (values) {
      // Map input value to typeof Required<GridColumn>
      // type definitions
      this._columns = values.map((column) => ({
        ...column,
        field: column.field || column.label || '',
        style: column.style
          ? {
              class: Array.isArray(column.style.class)
                ? column.style.class.join(' ')
                : column.style.class || '',
              styles: Array.isArray(column.style.styles)
                ? column.style.styles.join(' ')
                : column.style.class || '',
            }
          : {},
        type: column.type || 'string',
        transform: column.transform || 'default',
        sort: column.sort || {
          compare: (a: unknown, b: unknown) => {
            return Number(ClrDatagridSortOrder.DESC);
          },
        },
      }));
    }
  }
  get columns(): Required<GridColumnType>[] {
    return this._columns;
  }
  //! Datagrid columns configuraiton inputs

  public readonly defaultSort = ClrDatagridSortOrder.DESC;

  // Output definitions
  @Output() selectedChange = new EventEmitter<unknown[] | unknown>();
  @Output() dgRefresh = new EventEmitter<ClrDatagridStateInterface<unknown>>();
  @Output() detailChange = new EventEmitter<unknown>();

  // Listen to internal grid component select changes and notify parent component
  onSelectedStateChanges(state: unknown[] | unknown) {
    this.selectedChange.emit(state);
  }

  geetCellValue(element: Record<string, any>, key: string) {
    return JSObject.getProperty(element, key) ?? '';
  }
}
