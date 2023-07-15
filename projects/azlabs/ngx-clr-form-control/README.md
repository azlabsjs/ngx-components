# Ngx Clarity Form control

The `ngx-clr-form-control` library provide angular UI component for rendering input elements from `json` configuration object. It's a UI component extracted from `@azlabs/ngx-smart-form` library that provides bindings for clarity library.

## Dependencies

| @azlabsjs/ngx-clr-form-control | @azlabsjs/smart-form-core | @azlabsjs/ngx-intl-tel-input | @azlabsjs/ngx-options-input | @azlabsjs/ngx-file-input | Angular |
| ------------------------------ | ------------------------- | ---------------------------- | --------------------------- | ------------------------ | ------- |
| ^0.15.x                        | ^0.2.0                    | ^0.15.x                      | ^0.15.x                     | ^0.15.x                  | ^15.0   |

## Usage

To use the `ngx-clr-form-control` in angular projects, we must import the library module which export required component, and pipes and directives:

```ts
// app.module.ts
import { NgxClrFormControlModule } from "@azlabsjs/ngx-clr-form-control";

@NgModule({
  imports: [NgxClrFormControlModule],
})
export class AppModule {}
```

Then use the component in your project:

```ts
import { FormControl } from "@angular/forms";
import { TextInput } from "@azlabsjs/smart-form-core";

export class MyComponent {
  textInputControl = new FormControl();
  textInput: TextInput = {
    label: "Firstname",
    type: "text",
    name: "name",
    classes: "clr-input",
    isRepeatable: false,
    containerClass: "clr-col-6",
  };
}
```

```html
<h3>Text Control</h3>
<br />
<ngx-clr-form-control [class]="'ngx-smart-form-control ' + textInput.containerClass" [hidden]="textInput.hidden" [control]="textInputControl" [inputConfig]="textInput"></ngx-clr-form-control>
<h3>Text Area Control</h3>
```

- Options providers

Options providers are angular service that are used by `radio`, `checkox` and `select` elements to query options from backend services:

```ts
// app.module.ts
import { NgxClrFormControlModule } from "@azlabsjs/ngx-clr-form-control";

@NgModule({
  imports: [
    NgxClrFormControlModule.forRoot({
      options: {
        requests: {
          interceptorFactory: (injector: Injector) => {
            // TODO: Provide request interceptors
          },
          queries: {
            // .. queries configurations per control names
          },
        },
      },
    }),
  ],
})
export class AppModule {}
```

- Upload providers

`ngx-clr-form-control` provide integrates `ngx-file-input` library for handling file contents. The library also provides an automatic upload which uses an upload service configurable in the root of your project as follow:

```ts
// app.module.ts
import { NgxClrFormControlModule } from "@azlabsjs/ngx-clr-form-control";

@NgModule({
  imports: [
    NgxClrFormControlModule.forRoot({
      uploads: {
        options: {
          interceptorFactory: (injector: Injector) => {
            // Replace the interceptor function by using the injector
            return (request, next) => {
            // TODO: Provide request interceptors
            };
          },
        },
        // Files upload url
        url: 'https://127.0.0.1/api/storage/object/upload',
      
    }),
  ],
})
export class AppModule {}
```

**Note** Library is still under development and API might change. Please consult the current page for any version update.