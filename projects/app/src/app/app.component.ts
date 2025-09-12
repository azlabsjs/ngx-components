import {
  AsyncPipe,
  CommonModule,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridColumnType, GridConfigType } from '@azlabsjs/ngx-clr-smart-grid';
import { COMMON_PIPES, createPipeTransform } from '@azlabsjs/ngx-common';
import { createSlide } from '@azlabsjs/ngx-slides';
import {
  FormsClient,
  FORM_CLIENT,
  uniqueValidator,
  HTTP_REQUEST_CLIENT,
  RequestClient,
  existsValidator,
} from '@azlabsjs/ngx-smart-form';
import {
  FileInput,
  FormConfigInterface,
  InputTypes,
} from '@azlabsjs/smart-form-core';
import { BehaviorSubject, filter, Subject, takeUntil, tap } from 'rxjs';
import { TestPipe, TRANSLATE_PIPES } from './pipes';
import { FORM_CONTROL_DIRECTIVES } from '@azlabsjs/ngx-clr-form-control';
import { DIRECTIVES as GRID_DIRECTIVES } from '@azlabsjs/ngx-clr-smart-grid';
import { FormControlComponent } from './form-control/form-control.component';
import { ClarityModule } from '@clr/angular';
import { ReactiveFormDirectiveInterface } from 'projects/azlabs/ngx-smart-form/src/lib';
import { ModalComponent } from '@azlabs/ngx-modal';

const _values = {
  data: [
    {
      id: 1,
      firstname: 'RODRIGUE',
      lastname: 'KOLANI',
      type: 'INDIVIDUEL',
      sex: 'M',
      address: {
        phone: '+22892146591',
        nationality: 'TG',
      },
      test: 'Test value 1',
    },
    {
      id: 2,
      firstname: 'SONATA',
      lastname: 'PAKIONA',
      type: 'INDIVIDUEL',
      sex: 'M',
      address: {
        phone: '+22890250454',
        nationality: 'TG',
      },
      test: 'Test value 2',
    },
    {
      id: 3,
      firstname: 'ANIKA',
      lastname: 'AGBAGBE',
      sex: 'F',
      type: 'INDIVIDUEL',
      address: {
        phone: '+22898757475',
        nationality: 'TG',
      },
      test: 'Test value 3',
    },
  ],
};

type ValuesType = typeof _values;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent implements OnInit {
  formControl = new FormControl<string | undefined>(undefined);
  input: FileInput = {
    uploadUrl: 'https://storagev2.lik.tg/api/storage/object/upload',
    pattern: 'image/*',
    multiple: false,
    maxFileSize: 40,
    autoupload: true,
    uploadAs: 'content',
    label: 'My File',
    type: InputTypes.FILE_INPUT,
    name: 'content',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-sm-12',
  };
  //
  _state$ = new BehaviorSubject<FormConfigInterface | undefined>(undefined);
  state$ = this._state$.asObservable();
  private _destroy$ = new Subject<void>();
  @ViewChild('formRef', { static: false })
  private smartForm!: ReactiveFormDirectiveInterface;

  // Columns configuration
  public columns: GridColumnType[] = [
    {
      title: 'app.modules.persons.firstname',
      property: 'lastname',
    },
    {
      title: 'app.modules.persons.lastname',
      property: 'firstname',
      transform: [
        'uppercase',
        (value: string) =>
          `${value.substring(0, 1).toLowerCase()}${value.substring(1)}`,
      ],
    },
    {
      title: 'app.modules.persons.type',
      property: 'type',
    },
    {
      title: 'app.modules.persons.phone_number',
      property: 'address.phone',
    },
    {
      title: 'app.modules.persons.gender',
      property: 'sex',
      style: {
        class: (value) => {
          return String(value) === 'F'
            ? 'label label-success'
            : 'label label-danger';
        },
      },
    },
    {
      title: 'app.modules.persons.nationality',
      property: 'address.nationality',
      transform: createPipeTransform(this.lowercasePipe),
    },
    {
      title: 'app.modules.persons.test',
      property: 'test',
      transform: 'testPipe',
      style: {
        // class: ,
      },
    },
  ];

  _pageResult$ = new Subject<ValuesType | undefined>();
  pageResult$ = this._pageResult$.asObservable();
  placeholder: string | undefined = 'Loading, Please wait...';

  gridConfig: Partial<GridConfigType> = {
    selectable: true,
    singleSelection: false,
    transformColumnTitle: ['asyncText'],
    capitalizeColumnTitle: true,
    useServerPagination: true,
    projectRowClass: (current: { id: number }) => {
      return current.id === 3 ? 'my-row' : '';
    },
  };

  slides = [
    createSlide(1, 'https://picsum.photos/id/1/200/300'),
    createSlide(2, 'https://picsum.photos/id/1000/200/300'),
    createSlide(3, 'https://picsum.photos/id/1001/200/300'),
    createSlide(4, 'https://picsum.photos/id/1002/200/300'),
  ];

  fromState = {
    fruits: ['2', '3', '4'],
    category_id: 1,
    lastname: 'AZOMEDOH',
    firstname: 'KOMI SIDOINE',
    // profession: 'INFORMATIQUE',
    stakeholders: [
      {
        firstname: 'EKUE',
        lastname: 'AYI',
        profession: 'INFORMATIQUE',
      },
      {
        firstname: 'RODRIGUE',
        lastname: 'KOLANI',
        profession: 'RESEARCH',
        category_id: 2,
      },
    ],
    phonenumber: ['22891969456', '22892384958'],
    persons: {
      firstname: 'MADELEINE',
      lastname: 'DE LA COURT',
      email: 'madeleined@example.com',
    },
  };

  required = false;
  control = new FormControl<string | undefined>(undefined);
  haserror = false;

  public constructor(
    @Inject(FORM_CLIENT) private client: FormsClient,
    private lowercasePipe: LowerCasePipe,
    @Inject(HTTP_REQUEST_CLIENT) private httpClient: RequestClient,
    @Optional() private cdRef: ChangeDetectorRef | null
  ) {
    this.client
      .get(220)
      .pipe(
        filter((state) => typeof state !== 'undefined' && state !== null),
        tap((state) => console.log('Form: ', state)),
        tap((state) => this._state$.next(state)),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  onOpenChange(_t28: ModalComponent) {
    console.log('modal: ', _t28);
    _t28.open();
  }

  formModalStateChange() {
    this.cdRef?.detectChanges();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this._pageResult$.next(_values);
      this.placeholder = undefined;
    }, 3000);
  }

  // Listen to datagrid refresh events
  onDgRefresh(_: unknown) {
    // console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }

  onFormReadyState(event: FormConfigInterface) {
    setTimeout(() => {
      this.smartForm?.addAsyncValidator(
        existsValidator(this.httpClient, {
          // query: 'user_details__email',
          fn: `http://127.0.0.1:3000/categories`,
          conditions: (_: unknown) => {
            return false;
          },
          // error: 'Adresse mail non existant!'
        }),
        'category_id'
      );
    }, 1000);

    const timeout = setTimeout(() => {
      this.smartForm.setValue(this.fromState);
      clearTimeout(timeout);
    }, 3000);
  }

  afterChanges() {
    // const timeout = setTimeout(() => {
    //   this.smartForm
    //     ?.controlValueChanges('profession')
    //     .pipe(tap((state) => console.log('State changes:', state)))
    //     .subscribe();
    //   clearTimeout(timeout);
    // }, 300);
  }

  onBlur(event: FocusEvent) {
    console.log(event);
  }

  onFocus(event: FocusEvent) {
    console.log(event);
  }

  onError(error: unknown) {
    console.log('Submit error: ', error);
  }

  ngxFormSubmit(event: Record<string, any>) {
    console.log(JSON.stringify(event));
  }

  ondgItemClick(value: unknown) {
    console.log('Item clicked:', value);
  }
}
