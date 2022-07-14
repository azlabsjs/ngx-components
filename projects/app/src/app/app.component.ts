import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GridColumnType } from '@azlabsjs/ngx-clr-smart-grid';
import { FormsClient, FORM_CLIENT } from '@azlabsjs/ngx-smart-form';
import { createSlide } from '@azlabsjs/ngx-slides';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  //
  form$ = this.client.get(1);

  //
  control = new FormControl();

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
      label: 'phone',
    },
    {
      title: 'Genre',
      label: 'sex'
    },
    {
      title: 'Nationalité',
      label: 'nationality'
    }
  ];
  // Test data
  public data = [
    {
      id: 1,
      firstname: 'RODRIGUE',
      lastname: 'KOLANI',
      type: 'INDIVIDUEL',
      phone: '+22892146591',
      sex: 'M',
      nationality: 'TG',
    },
    {
      id: 2,
      firstname: 'SONATA',
      lastname: 'PAKIONA',
      type: 'INDIVIDUEL',
      phone: '+22890250454',
      sex: 'M',
      nationality: 'TG',
    },
    {
      id: 3,
      firstname: 'ANIKA',
      lastname: 'AGBAGBE',
      phone: '+22898757475',
      type: 'INDIVIDUEL',
      sex: 'F',
      nationality: 'TG',
    },
  ];

  slides = [
    createSlide(1, 'https://picsum.photos/id/1/200/300'),
    createSlide(2, 'https://picsum.photos/id/1000/200/300'),
    createSlide(3, 'https://picsum.photos/id/1001/200/300'),
    createSlide(4, 'https://picsum.photos/id/1002/200/300')
  ];

  public constructor(@Inject(FORM_CLIENT) private client: FormsClient) {}

  // Listen to datagrid refresh events
  onDgRefresh(event: unknown) {
    console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }
}
