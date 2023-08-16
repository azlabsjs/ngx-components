# NgxCommon

This library contains common pipe, directives and utilities used by `@azlbsjs` namespaced components

## Dependencies

| @azlabsjs/ngx-common | @azlabsjs/js-datetime | @azlabsjs/js-object   | Angular |
| -------------------- | --------------------- | --------------------- | ------- |
| ^0.13.x              | ^0.1.x                | ^0.1.x                | ^13.0   |
| ^0.14.x              | ^0.1.x                | ^0.1.x                | ^14.0   |
| ^0.15.x              | ^0.1.x                | ^0.1.x                | ^15.0   |

## Installation

To install the package with all peer dependencies:

> npm install --save @azlabsjs/js-datetime @azlabsjs/js-object @azlabsjs/ngx-common

## Usage

Basically the implementation comes with a module that exports declarations required to work with the module. In your root application module, or any child module add this to your imports:

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
