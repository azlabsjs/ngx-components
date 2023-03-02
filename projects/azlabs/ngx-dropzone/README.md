# NgxDropzone

Angular dropzone component build on top of `dropzone.js` [https://docs.dropzone.dev/] javascript library.

## Dependencies

| @azlabsjs/ngx-dropzone | Angular | dropzone      |
| ---------------------- | ------- | ------------- |
| ^0.13.x                | ^13.0   | ^6.0.0.beta-2 |
| ^0.14.x                | ^14.0   | ^6.0.0.beta-2 |

## Usage

To include the API in your angular project, you must import it module into the root of your application.

```ts
// app.module.ts

// ...

import { NgxDropzoneModule } from '@azlabsjs/ngx-smart-form';

@NgModule({
    // ...
    imports: [
        NgxDropzoneModule.forRoot({
            //... Dropzone configuration
        })
    ]
})
```

### Using dropzone component

```html
<ngx-smart-dz
  [config]="dropzoneConfigs"
  (removed)="onDropzoneFileRemoved($event)"
  (added)="onDropzoneFileAdd($event)"
  [multiple]="inputConfig.multiple"
  (acceptedFiles)="onAcceptedFiles($event)"
  (reset)="onReset()"
></ngx-smart-dz>
```

Below is your typescript source code:

```ts
import { DropzoneConfig } from "@azlabsjs/ngx-dropzone";

export class MyComponent {
  /**
   * Dropzone configuration interface
   */
  dropzoneConfigs: DropzoneConfig;

  onDropzoneFileRemoved(event: unkown) {
    // Listen for event that get trigger when a file is removed from the dropzone
  }

  onDropzoneFileAdd(event: unkown) {
    // Listen for event that get trigger when a file is added to the dropzone
  }

  onAcceptedFiles(event: File[]) {
    // Interact with the accpeted files
  }

  onDropdownReset() {
    // Listen to reset event on the dropdown
  }
}
```

### Dropzone Configuration

As the library is entirely based on `dropzone.js` javascript library, all options located at [https://docs.dropzone.dev/configuration/basics/configuration-options] can be based as parameter bootraping the module at the root of your project.
