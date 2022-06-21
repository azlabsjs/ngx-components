import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormsClient, FORM_CLIENT } from '@iazlabs/ngx-smart-form';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  //
  form$ = this.client.get(65);

  //
  control = new FormControl();

  public constructor(@Inject(FORM_CLIENT) private client: FormsClient) {}
}
