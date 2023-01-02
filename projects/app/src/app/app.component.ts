import { LowerCasePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { createPipeTransform, GridColumnType } from '@azlabsjs/ngx-clr-smart-grid';
import { createSlide } from '@azlabsjs/ngx-slides';
import {
  FormsClient, FORM_CLIENT
} from '@azlabsjs/ngx-smart-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  //
  form$ = this.client.get(220);

  //
  control = new UntypedFormControl();

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
      transform: createPipeTransform(this.lowercasePipe)
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
    },
    {
      id: 2,
      firstname: 'SONATA',
      lastname: 'PAKIONA',
      type: 'INDIVIDUEL',
      address: {
        phone: '+22890250454',
        nationality: 'TG'
      },
      sex: 'M',
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
    },
  ];

  slides = [
    createSlide(1, 'https://picsum.photos/id/1/200/300'),
    createSlide(2, 'https://picsum.photos/id/1000/200/300'),
    createSlide(3, 'https://picsum.photos/id/1001/200/300'),
    createSlide(4, 'https://picsum.photos/id/1002/200/300'),
  ];

  public constructor(@Inject(FORM_CLIENT) private client: FormsClient, private lowercasePipe: LowerCasePipe) {}

  // Listen to datagrid refresh events
  onDgRefresh(event: unknown) {
    console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }

  ngxFormSubmit(event: Record<string, any>) {
    console.log(event);
  }
}
