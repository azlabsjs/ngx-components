import { LowerCasePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridColumnType, GridConfigType } from '@azlabsjs/ngx-clr-smart-grid';
import { createPipeTransform } from '@azlabsjs/ngx-common';
import { createSlide } from '@azlabsjs/ngx-slides';
import {
  FormsClient,
  FORM_CLIENT,
  ReactiveFormComponentInterface,
} from '@azlabsjs/ngx-smart-form';
import {
  FileInput,
  FormConfigInterface,
  InputTypes,
} from '@azlabsjs/smart-form-core';
import { BehaviorSubject, filter, Subject, takeUntil, tap } from 'rxjs';

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
})
export class AppComponent {
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
  @ViewChild('smartform', { static: false })
  smartForm!: ReactiveFormComponentInterface;

  // Columns configuration
  public columns: GridColumnType[] = [
    {
      title: 'Nom',
      label: 'lastname',
    },
    {
      title: 'Prénoms',
      label: 'firstname',
      transform: [
        'uppercase',
        (value: string) =>
          `${value.substring(0, 1).toLowerCase()}${value.substring(1)}`,
      ],
    },
    {
      title: 'Type',
      label: 'type',
    },
    {
      title: 'Téléphone',
      label: 'address.phone',
    },
    {
      title: 'Genre',
      label: 'sex',
    },
    {
      title: 'Nationalité',
      label: 'address.nationality',
      transform: createPipeTransform(this.lowercasePipe),
    },
    {
      title: 'Test',
      label: 'test',
      transform: 'testPipe',
      style: {
        class: 'label label-success p-top-bottom-12',
      },
    },
  ];

  pageResult = new Subject<ValuesType | undefined>();
  pageResult$ = this.pageResult.asObservable();
  placeholder: string | undefined = 'Loading, Please wait...';

  gridConfig: Partial<GridConfigType> = {
    transformColumnTitle: 'uppercase',
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
    profession: 'INFORMATIQUE',
    stakeholders: [
      {
        lastname: 'AYI',
        firstname: 'EKUE',
        profession: 'INFORMATIQUE',
      },
    ],
    phonenumber: ['22891969456', '22892384958'],
  };

  required = false;
  control = new FormControl<string | undefined>(undefined);
  haserror = false;

  public constructor(
    @Inject(FORM_CLIENT) private client: FormsClient,
    private lowercasePipe: LowerCasePipe
  ) {
    this.client
      .get(220)
      .pipe(
        filter((state) => typeof state !== 'undefined' && state !== null),
        tap((state) => this._state$.next(state)),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  // Listen to datagrid refresh events
  onDgRefresh(event: unknown) {
    console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }

  onFormReadyState(event: FormConfigInterface) {
    setTimeout(() => {
      this.pageResult.next(_values);
      this.placeholder = undefined;
      // this.smartForm.setControlValue('category_id', 1);
      // this.smartForm.setControlValue('fruits', [2, 4]);
      // this.client
      //   .get(234)
      //   .pipe(
      //     filter((state) => typeof state !== 'undefined' && state !== null),
      //     tap((state) => {
      //       const { controlConfigs } = event;
      //       let values = [...controlConfigs];
      //       const index = values.findIndex(
      //         (current) => current.name === 'stakeholders'
      //       );
      //       if (index !== -1) {
      //         const stakeHolders = {
      //           ...(values[index] as InputGroup),
      //           children: state.controlConfigs,
      //         } as InputGroup;
      //         values.splice(index, 1, stakeHolders);
      //       }
      //       this._state$.next({ ...event, controlConfigs: values });
      //     }),
      //     takeUntil(this._destroy$)
      //   )
      //   .subscribe();
    }, 5000);

    setTimeout(() => {
      this.smartForm.setValue(this.fromState);
    }, 5000);
  }

  afterChanges() {
    setTimeout(() => {
      this.smartForm
        ?.controlValueChanges('profession')
        .pipe(tap((state) => console.log('State changes:', state)))
        .subscribe();
    }, 300);
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
}
