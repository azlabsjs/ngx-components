# Smart form component

Smart form component is an angular component that abstract native platform form element configuration and create operations using javascript object.
The module also makes use of angular services injector to provide mechanism for loading and building javascript form objects.

## Dependencies

| @azlabsjs/ngx-smart-form | @azlabsjs/ngx-dropzone | @azlabsjs/ngx-intl-tel-input | Angular |
|------------------------|----------------------|----------------------------|---------|
| ^0.13.x                | ^0.13.x              | ^0.13.x                    | ^13.0   |
| ^0.14.x                | ^0.14.x              | ^0.14.x                    | ^14.0   |

* Basic usage

To include the API in your angular project, you must import it module into the root of your application.

```ts
// app.module.ts

// ...

import {NgxSmartFormModule} from '@azlabsjs/ngx-smart-form';

@NgModule({
  imports: [
    NgxSmartFormModule.forRoot({
      // Optional : Required only to get data dynamically from the server
      // Server configuration for dynamically loading
      // Select, Checkbox and Radio button from server
      serverConfigs: {
        api: {
          host: environment.forms.host,
          // Custom path on the server else the default is used
          bindings: environment.forms.endpoints.bindingsPath,
        },
      },
      // Path to the form assets
      // This path will be used the http handler to load the forms in cache
      formsAssets: "/assets/resources/jsonforms.json",
    })
  ]
})
```

To use the smart form component in your component, simply include it requirements in your component template as follow:

```html
<!-- ... -->
<ngx-smart-form [form]="form">
</ngx-smart-form>
```

Note: By default the smart component will use default configuration to create controls and default button for adding new control or group of controls if the control is repeatable.

Also you should note that the form is not submittable by default. To make the form submitable, you should pass the input property `submitable` , which is a boolean value, as a parameter.

```html
<!-- ... -->
<!-- This add a submit button to the form component -->
<ngx-smart-form [form]="form" [submitable]="true">
</ngx-smart-form>
```

* Customization

Smart form component tries it best to be flexible enough for cutomization, using angular template directive to pass configurations to the smart form element.

-- Injecting a submit button:

```html
<ngx-smart-form [form]="form" [submitable]="true" (submit)="onFormSubmit($event)">
    <ng-template #submitButton let-handler>
        <button class="btn btn-primary" (click)="handler($event)">
            <clr-icon shape="circle-arrow" dir="up"></clr-icon>
            SOUMETTRE
        </button>
    </ng-template>
</ngx-smart-form>
```

**Warning**
`let-handler` declaration in the template above provide the custom button with method for calling the internal submit event of the smart form component. It binds to the smart component therefore any reference to `this` points to the `smart form component` .

-- Injecting a customized form control component:

As developper we are tend to provide our own custom implementation of HTML elements, therefore instead of using default `ngx-smart-form-control` that comes with the `smart form component` , developpers can provide their own customized version:

```ts
// Custom smart input implementation
import { InputInterface } from '@azlabsjs/ngx-smart-form';

@Component({
  selector: 'app-custom-smart-input'
})
export class MyCustomSmartInput {

  @Input() input!: InputInterface;
  @Input() control!: AbstractControl;

  // ...

}
```

```html
<ngx-smart-form [form]="form" [submitable]="true" [template]="template">
    <ng-template #template let-input="value" let-control="control">
        <app-custom-smart-input [input]="input" [control]="control">
        </app-custom-smart-input>
    </ng-template>
</ngx-smart-form>
```

-- Injecting an icon for repeatable controls:

By default the smart form component comes with a default floating action button for adding more control when the group or the control is repeatable. In order to provide your own custom component, you must inject your own template:

```html
<ngx-smart-form [form]="form" [submitable]="true" [template]="template">
    <ng-template #addTemplate let-handler>
        <div class="button" (click)="handler($event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="8px" height="8px" viewBox="0 0 24 24">
                <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
            </svg>
        </div>
    </ng-template>
</ngx-smart-form>
```

* Services

As mentionned above, the smart form component comes with services for loading form from the cache if the exists.

```ts

// ...
import { FORM_CLIENT } from "path/smart-forms/angular";
import { FormsClient } from "path/smart-forms/core";

export class MyFormComponent {
    // Get the form with the id 65 from the cache object
    // This returns an observable of the form object that can be passed
    // to the smart form
    form$ = this.formsClient.get(65);

    constructor(
      @Inject(FORM_CLIENT) private formsClient: FormsClient
    ) {}
}
```

The html template will be as follow:

```html
<!-- ... -->
<ng-container *ngIf="form$ | async as vm">
    <ngx-smart-form [form]="vm">
    </ngx-smart-form>
</ng-container>
```
