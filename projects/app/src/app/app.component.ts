import { LowerCasePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  //
  form$ = this.client.get(220);
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
  public data = [
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
  ];

  pageResult = {
    data: this.data.slice(1),
    total: this.data.length,
  };
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
  };

  public constructor(
    @Inject(FORM_CLIENT) private client: FormsClient,
    private lowercasePipe: LowerCasePipe
  ) {}

  // Listen to datagrid refresh events
  onDgRefresh(event: unknown) {
    console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }

  onFormReadyState(state: unknown) {
    console.log(state);
    setTimeout(() => {
      console.log('Setting control value...');
      this.smartForm.setControlValue('category_id', 1);
      this.smartForm.setControlValue('fruits', [2, 4]);
    }, 3000);

    setTimeout(() => {
      this.smartForm.setValue(this.fromState);
    }, 5000);
  }

  onError(error: unknown) {
    console.log('Submit error: ', error);
  }

  ngxFormSubmit(event: Record<string, any>) {
    console.log(JSON.stringify(event));
  }
}
