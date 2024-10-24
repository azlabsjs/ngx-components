# Smart form component

Smart form component is an angular component that abstract native platform form element configuration and create operations using javascript object.
The module also makes use of angular services injector to provide mechanism for loading and building javascript form objects.

**Note** The library is still under development, therefore the API is subject to change. Please consult this documentation for each version release to stay up-to-date with latest changes.

## Dependencies

| @azlabsjs/ngx-smart-form | @azlabsjs/smart-form-core | @azlabsjs/requests | Angular |
| ------------------------ | ------------------------- | ------------------ | ------- |
| ^0.13.x                  | ^0.1.x                    | ^0.1.x             | ^13.0   |
| ^0.14.x                  | ^0.1.x                    | ^0.2.x             | ^14.0   |
| ^0.15.x                  | ^0.2.x                    | ^0.2.x             | ^15.0   |
| ^0.17.x                  | ^0.2.x                    | ^0.2.x             | ^17.0   |

## Installation

To install the package with all required dependencies:

> npm install --save @azlabsjs/smart-form-core @azlabsjs/requests @azlabsjs/ngx-smart-form

## Usage

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
          // The host base path to use when sending http request
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
<ngx-smart-form [form]="form"></ngx-smart-form>
```

Note: By default the smart component will use default configuration to create controls and default button for adding new control or group of controls if the control is repeatable.

Also you should note that the form is not submittable by default. To make the form submitable, you should pass the input property `submitable` , which is a boolean value, as a parameter.

```html
<!-- ... -->
<!-- This add a submit button to the form component -->
<ngx-smart-form [form]="form" [submitable]="true"> </ngx-smart-form>
```

- Customization

Smart form component tries it best to be flexible enough for cutomization, using angular template directive to pass configurations to the smart form element.

-- Injecting a submit button:

```html
<ngx-smart-form [form]="form" [submitable]="true" (submit)="onFormSubmit($event)">
  <ng-template #submitButton let-handler>
    <button class="btn btn-primary" (click)="handler($event)">
      <cds-icon shape="circle-arrow" dir="up"></cds-icon>
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
import { InputInterface } from "@azlabsjs/ngx-smart-form";

@Component({
  selector: "app-custom-smart-input",
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
    <app-custom-smart-input [input]="input" [control]="control"> </app-custom-smart-input>
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

- Services

As mentionned above, the smart form component comes with services for loading form from the cache if the exists.

```ts
// ...
import { FORM_CLIENT, FormsClient } from "@azlabsjs/ngx-smart-form";

export class MyFormComponent {
  // Get the form with the id 65 from the cache object
  // This returns an observable of the form object that can be passed
  // to the smart form
  form$ = this.formsClient.get(65);

  constructor(@Inject(FORM_CLIENT) private formsClient: FormsClient) {}
}
```

The html template will be as follow:

```html
<!-- ... -->
<ng-container *ngIf="form$ | async as vm">
  <ngx-smart-form [form]="vm"> </ngx-smart-form>
</ng-container>
```

- File upload handler

The package provides services & component for uploading files to a remote files server automatically.

**Note**
File upload response must contain an `id` attribute which is used to set the value of the control binded to the form input, else the entire response object is set as the form input control value.

In order to enable the auto uploading on the smart form component:

```html
<!-- At the template level -->
<ng-container *ngIf="form$ | async as vm">
  <ngx-smart-form [form]="vm" [autoupload]="true"> </ngx-smart-form>
</ng-container>
```

```ts
// At the typescript level
// app.module.ts
import { NgxSmartFormModule } from '@azlabsjs/ngx-smart-form';

@NgModule({
  imports: [
    NgxSmartFormModule.forRoot({
      // ... other configuration
      uploadOptions: {
        interceptorFactory: (injector: Injector) => {
          // Replace the interceptor function by using the injector
          return (request, next) => {
            // Interact with request object before being send
            // to file(s) server(s)
            return next(request);
          };
        },
      },
    })
  ]
})
```

**Warning** Version `0.15.x` changes

From version `0.15.x`, breaking changes have been introduced, which does not support `uploadOptions` property in the smart form module configuration object. Therefore from version `0.15.x` the configuration above is no more valid.

- Form auto submission

Sometimes based systems requirements, developpers might not need to handle form submission manually. Therefore the smart form package implementation offers the ability to automatically submit form without the needs of a dedicated http service implementation.

At the template level, in order to use the auto submit functionnality developpers must configure the `autosubmit` and `path` input properties.

```html
<ngx-smart-form [submitable]="true" [autoupload]="true" [form]="form" [autoSubmit]="true" [path]="'api/v1/customers'"></ngx-smart-form>
```

**Note**
To intercept the submit request and modify the request body or headers, developpers must provide an interceptor factory function at the root level of the angular application:

```ts
// app.module.ts
import { NgxSmartFormModule } from '@azlabsjs/ngx-smart-form';

@NgModule({
  imports: [
    NgxSmartFormModule.forRoot({
      // ... other configuration
      submitRequest: {
        interceptorFactory: (injector: Injector) => {
          // Replace the interceptor function by using the injector
          return (request, next) => {
            // Interact with request object before being send
            // to file(s) server(s)
            return next(request);
          };
        },
      },
    })
  ]
})
```

## Custom URL support

From version `0.13.21` the package add support for custom URL when querying for options using HTTP (TCP) interface. Now option configurations can define URL that are compile at runtime to generate HTTP url based on the configured `serverConfigs.api.host` entry in the root module.

- Requirements

-- Define a custom URI scheme in place of table or url in your `forms.json` file

**Note**
Custom URI scheme looks like `uri:/<PATH>` or `url:/<PATH>`. The `/` before the path is required, else the compilation phase of the custom url will fail. Hence form with an option input looking like:

```json
{
  //...
  "controls": [
    //...
    {
      //...
      "selectableModel": "table:https://<HOST>/path|model:https://<HOST>/path"
      // Note: For newer form generated by the backend, this is similar to
      // "optionsConfig": "table:https://<HOST>/path|model:https://<HOST>/path",
    }
  ]
}
```

can be converted to :

```json
{
  //...
  "controls": [
    //...
    {
      //...
      "selectableModel": "table:uri:/path|model:uri:/path"
    }
  ]
}
```

in order for the option input configuration to be candidate custom url compiler.

-- Configure `NgxSmartFormModule` with host bindings

```ts
// app.module.ts

@NgModule({
  imports: [
    NgxSmartFormModule.forRoot({
      // ...
      serverConfigs: {
        api: {
          // Without the line below, custom uri are not compile properly
          host: environment.forms.host,
        },
      },
      // ...
    }),
  ],
})
export class AppModule {}
```

**Warning**
Without the `host` configuration uri will not compile properly, therefore a de-facto requirment for using custom URL is by configuring this property.

**Warning**
The package is still under development therefore the API is subject to change. Any update to the package api will be mentionned in the current documentation if required.

## Inserting custom HTML template before and after form controls

From version `0.13.24`, `ngx-smart-form` component add support for projected html templates that can be placed before and after the main form component. This allows developper to project custom templates or other forms into the component.

To project a template before controls simply add `before` attribute to the template container as follow:

```html
<ng-container *ngIf="form$ | async as form">
  <ngx-smart-form [form]="form" [autoSubmit]="true" [path]="'customers'">
    <div before>
      <p>Hello I am before form controls</p>
    </div>
  </ngx-smart-form>
</ng-container>
```

Intuitively, to project content after controls, simply add `after` to the container of the template to project:

```html
<ng-container *ngIf="form$ | async as form">
  <ngx-smart-form [form]="form" [autoSubmit]="true" [path]="'customers'">
    <div after>
      <p>Hello I am after form controls</p>
    </div>
  </ngx-smart-form>
</ng-container>
```

### Version ^0.15.x breaking changes

From version `0.15.x`, smart form component does not provide internal implementation for rendering inputs.
The component relies on angular content projection AI that allow developpers to provide their own inputs redering component. For easy transition, developpers can use the `@azlabs/ngx-clr-form-control` library components which provides clarity design input components for redering input elements. Below are configuration required for migration purpose:

```ts
import { NgxSmartFormModule } from '@azlabsjs/ngx-smart-form';
import { NgxClrFormControlModule } from '@azlabsjs/ngx-clr-form-control';

// app.module.ts
@NgModule({
  // ...
  imports: [
    NgxSmartFormModule.forRoot(...),
    // Configure the clr form control module library
    NgxClrFormControlModule.forRoot(...)
  ]
})
export class AppModule {

}
```

```html
<!-- HTML code below uses the ngx-clr-form-control component for previewing input elements -->
<ngx-smart-form [template]="controlTemplate">
  <ng-template #controlTemplate let-config="value" let-control="control">
    <ngx-clr-form-control [class]="'ngx-smart-form-control ' + config.containerClass" [hidden]="config.hidden" [control]="control" [inputConfig]="config"></ngx-clr-form-control>
  </ng-template>
</ngx-smart-form>
```
