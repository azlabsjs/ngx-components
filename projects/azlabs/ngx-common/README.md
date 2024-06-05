# NgxCommon

This library contains common pipe, directives and utilities used by `@azlbsjs` namespaced components

## Dependencies

| @azlabsjs/ngx-common | @azlabsjs/js-datetime | @azlabsjs/js-object   | Angular |
| -------------------- | --------------------- | --------------------- | ------- |
| ^0.13.x              | ^0.1.x                | ^0.1.x                | ^13.0   |
| ^0.14.x              | ^0.1.x                | ^0.1.x                | ^14.0   |
| ^0.15.x              | ^0.1.x                | ^0.1.x                | ^15.0   |
| ^0.17.x              | ^0.2.x                | ^0.2.x                | ^17.0   |

## Installation

To install the package with all peer dependencies:

> npm install --save @azlabsjs/js-datetime @azlabsjs/js-object @azlabsjs/ngx-common

## Usage

`@azlabsjs/ngx-common` comes with a module that exports declarations required to work with the module. In your root application module, or any child module add this to your imports:

```ts
// app.module.ts

import { NgxCommonModule } from "@azlabsjs/ngx-common";

@NgModule({
  imports: [
    // ...
    NgxCommonModule,
  ],
})
export class AppModule {}
```


## Version >= 0.17.x changes

Version `0.17.x` release of the library emphasize on the use of standalone directives and pipes, therefore the `NgxCommonModule` has been marked as deprecated and it's recommended to import `COMMON_PIPES` to used the list of pipe utilities that the library provides.

Also, `transform` pipe requires developper to register custom pipes using `providePipes(...)` provider factory function.

**Note** Using the new `providePipes` factory provider, requires custom pipes to be declared with the `@Injectable({ provideIn: 'any|root|platform'})`, as the library does not automatically register the pipe as a service provider anymore.

- common strings

The `commonStrings` pipe is a helper pipe that allow developper to configure an object representing application text content
that can be loaded at runtime using `.` separated property names, providing a single source of truth for application content.

In order to use the `commonStrings` pipe within your angular application, developper needs to register it provider using `provideCommonStrings()` provider factory at the application module level.


```ts

import { provideCommonStrings, COMMON_PIPES } from '@azlabsjs/ngx-common';

@NgModule({
  declarations: [AppComponent],
  imports: [...COMMON_PIPES],
  providers: [
    // Delay for 2 seconds and provide an object representing the application text content
    provideCommonStrings(
      timer(2000).pipe(
        map(() => ({
          app: {
            modules: {
              users: {
                title: 'Users Administration',
              },
            },
          },
        }))
      )
    )
  ]
})
export class AppModule {}

// Using text pipe to resolve the value for the uses module, title property as follow

@Component({
  // ...
  template: `
    <h3>{{ 'app.modules.users.title' | text }}</h3>
  `
})
export class AppComponent {

}
```