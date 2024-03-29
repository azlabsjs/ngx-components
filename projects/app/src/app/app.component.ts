import { LowerCasePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  createPipeTransform,
  GridColumnType,
  GridConfigType
} from '@azlabsjs/ngx-clr-smart-grid';
import { createSlide } from '@azlabsjs/ngx-slides';
import {
  FormsClient,
  FORM_CLIENT,
  ReactiveFormComponentInterface
} from '@azlabsjs/ngx-smart-form';
import {
  FileInput,
  FormConfigInterface,
  InputGroup,
  InputTypes
} from '@azlabsjs/smart-form-core';
import {
  BehaviorSubject,
  filter,
  startWith,
  Subject,
  takeUntil,
  tap
} from 'rxjs';

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
  ]
};

type ValuesType = typeof _values;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  formControl = new FormControl();
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
  // Test data
  private _data = new Subject<ValuesType>();
  public data$ = this._data.asObservable().pipe(startWith(undefined));
  public placeholder: string|undefined = 'Loading please wait...';

  gridConfig: Partial<GridConfigType> = {
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
    phonenumbers: ['22891969456', '22892384958'],
    phonenumber: '22890072872',
  };

  fromState2 = {
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
      {
        lastname: 'HARRY',
        firstname: 'KOUEVI',
        profession: 'SOFTWARE',
      },
    ],
    phonenumbers: ['22891969456'],
    phonenumber: '22890072872',
  };

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

    this.formControl.valueChanges
      .pipe(tap(console.log), takeUntil(this._destroy$))
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
      this._data.next(_values);
      this.placeholder = undefined;
      // this.smartForm.setControlValue('category_id', 1);
      // this.smartForm.setControlValue('fruits', [2, 4]);
      this.client
        .get(234)
        .pipe(
          filter((state) => typeof state !== 'undefined' && state !== null),
          tap((state) => {
            const { controlConfigs } = event;
            let values = [...controlConfigs];
            const index = values.findIndex(
              (current) => current.name === 'stakeholders'
            );
            if (index !== -1) {
              const stakeHolders = {
                ...(values[index] as InputGroup),
                children: state.controlConfigs,
              } as InputGroup;
              values.splice(index, 1, stakeHolders);
            }
            this._state$.next({ ...event, controlConfigs: values });
          }),
          takeUntil(this._destroy$)
        )
        .subscribe();
    }, 3000);

    setTimeout(() => {
      this.smartForm.setValue(this.fromState);
    }, 5000);

    setTimeout(() => {
      this.smartForm.setValue(this.fromState2);
    }, 7000);
  }

  onError(error: unknown) {
    console.log('Submit error: ', error);
  }


  onAcceptedFiles(event: any) {
    console.log(event);
  }

  onRemovedFile(event: any) {
    console.log('Removed file ...', event);
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

  ngxFormSubmit(event: Record<string, any>) {
    console.log(JSON.stringify(event));
  }
}
