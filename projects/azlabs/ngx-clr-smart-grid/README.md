# Smart Grid Component

Smart grid component is an angular component, using clarity datagrid component under the hood, that is highly configurable using angular `ng-template` directive for content projection and Javascript object for columns, datagrid and data configurations.

## Dependencies

| @azlabsjs/ngx-clr-smart-grid | @azlabsjs/js-object | @azlabsjs/js-datetime | @azlabsjs/js-datetime | Angular |
| ---------------------------- | ------------------- | --------------------- | --------------------- | ------- |
| ^0.13.x                      | ^0.1.x              | ^0.1.x                | ^0.1.x                | ^13.0   |
| ^0.14.x                      | ^0.1.x              | ^0.1.x                | ^0.1.x                | ^14.0   |

## Usage

Basically the implementation comes with a module that wrap required component and directives for the module to work. In your root application module, or any child module add this to your imports:

```ts
// app.module.ts

import { NgxClrSmartGridModule } from "@azlabsjs/ngx-clr-smart-grid";

@NgModule({
  imports: [
    // ...
    NgxClrSmartGridModule,
  ],
})
export class AppModule {}
```

- Registering custom pipe name

By default the datagrid offers support for commonly used by `date`,`datetime`,`timeago`,`month`,`masked`,`uppercase`,`lowercase`,`currency`,`decimal`,`json`,`percent`,`slice` for data transformation.
But sometimes developper might be required based on business rules, to create and support additional pipe. The Datagrid provide a way for registring additional pipe that are resolved at runtime. To register a list of additional pipe, at the root module or your application call the `NgxClrSmartGridModule.forRoot()` as follow:

```ts
// app.module.ts

import { NgxClrSmartGridModule } from "@azlabsjs/ngx-clr-smart-grid";

@NgModule({
  imports: [
    // ...
    NgxClrSmartGridModule.forRoot({
      pipeTransformMap: {
        testPipe: TestPipe,
      },
    }),
  ],
})
export class AppModule {}
```

**Note**
The example above register a pipe named `testpipe` with the transformation class `TestPipe`.

**Note**
The `TestPipe` is automatically registered as provider to the `NgxClrSmartGridModule`.

**Warning**
The only issue with using customized pipe, is that the pipe might be injectable. Therefore any custom pipe to be registered must be mark using `@Injectable()` as providing non injectable classes is subject to fail in future angular releases.

Example:

At it basic usage we simply add the component to our html template as most component in Angular framework:

```html
// app.component.html
<!-- Code -->
<!-- configure the smart grid using basic configurations -->
<ngx-clr-smart-grid
  [columns]="columns"
  [data]="data"
  (dgRefresh)="onDgRefresh($event)"
  (selectedChange)="onSelectedChanges($event)"
>
</ngx-clr-smart-grid>
```

```ts
import { Component, Inject } from "@angular/core";
import { GridColumnType } from "@azlabsjs/ngx-clr-smart-grid";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  // Columns configuration
  public columns: GridColumnType[] = [
    {
      title: "Nom",
      label: "lastname",
    },
    {
      title: "Prénoms",
      label: "firstname",
    },
    {
      title: "Type",
      label: "type",
    },
    {
      title: "Téléphone",
      label: "phone",
    },
  ];
  // Test data
  public data = [
    {
      id: 1,
      firstname: "RODRIGUE",
      lastname: "KOLANI",
      type: "INDIVIDUEL",
      phone: "+22892146591",
      sex: "M",
      nationality: "TG",
    },
    {
      id: 2,
      firstname: "SONATA",
      lastname: "PAKIONA",
      type: "INDIVIDUEL",
      phone: "+22890250454",
      sex: "M",
      nationality: "TG",
    },
    {
      id: 3,
      firstname: "ANIKA",
      lastname: "AGBAGBE",
      phone: "+22898757475",
      type: "INDIVIDUEL",
      sex: "F",
      nationality: "TG",
    },
    // ...
  ];

  // Listen to datagrid refresh events
  onDgRefresh(event: unknown) {
    console.log(event);
  }

  // Listen to data grid selection changes events
  onSelectedChanges(event: unknown | unknown[]) {
    console.log(event);
  }
}
```

With the basic example show on top, angular with render a datagrid to the view with configured data.

- Data Transformation

For most application data transformation may be required to provide formatted visual data to end users. Therefore datagrid columnsconfiguration support a `transform` property which can accept string value as well as function that apply transformation to data before showing it to end user.
As for the example above, we can simply add transformation as follow:

```ts
// app.component.ts
// ...

@Component({
  // ...
})
export class AppComponent {

  public function columns = [
    public columns: GridColumnType[] = [
    {
      title: "Nom",
      label: "lastname",
      transform: 'uppercase'
    },
    {
      title: "Prénoms",
      label: "firstname",
      transform: (readonly value) => value.toUppercase(),
    },
    // ...
  ];
  ];
}
```

Note: For `transform` property as string, basic angular pipes are supported as well as some custom pipes:

> 'date', 'datetime', 'timeago', 'month', 'masked', 'safecontent', 'saferesource', 'uppercase', 'lowercase', 'currency', 'decimal', 'json', 'percent', 'slice', 'async'.

**Note**
The syntax for pipe transform is as follow: `pipename:param1;param2`. Note that parameters are seperated using the `;`. As of now it's the only supported character for separating parameters (which might subject to change due to user requirement)

**Warning**
For parameters that as not primitive type, the library internally uses `JSON.parse()` call when the parameter is prefixed with `js:` or `json:` string. For example in order to pass `js` object to a pipe transform method that support object as parameter: `pipename:json:{"key1": "value1", "key2": "value2", ...}`

```ts
// app.component.ts
// ...

@Component({
  // ...
})
export class AppComponent {

  public function columns = [
    public columns: GridColumnType[] = [
    {
      title: "Nom",
      label: "lastname",
      transform: 'uppercase'
    },
    {
      title: "Prénoms",
      label: "firstname",
      transform: `translate:json:{"surename": "Joe"}`,
    },
    {
      title: "Date de naissance",
      label: "birthdate",
      transform: `date:YYYY-MM-DD`,
    },
    // ...
  ];
  ];
}
```

- Nested properties

In some scenarios, business requirements might require printing nested properties. To do so simply separated the top level from nested properties using `.` (dot) character. An example of such scenario can be found below:

```ts
export class Test Component {

  // ...

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

  //...
}
```

- Data grid customization

To customize the datagrid an input property is used:

```html
<ngx-clr-smart-grid
  [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasExpandableRows: false,
      hasDetails: true,
      selectable: true,
      singleSelection: false
    }"
  [columns]="columns"
  [data]="data"
  (dgRefresh)="onDgRefresh($event)"
  (selectedChange)="onSelectedChanges($event)"
>
</ngx-clr-smart-grid>
```

The Type defintion for datagrid customization is as follow:

```ts
export type GridConfigType = {
  selectable: boolean;
  class: string;
  sizeOptions: number[];
  pageSize: number;
  selectableProp: string;
  preserveSelection: boolean;
  singleSelection: boolean;
  hasActionOverflow: boolean;
  hasDetails: boolean;
  hasExpandableRows: boolean;
  useServerPagination: boolean;
  useCustomFilters: boolean;
  totalItemLabel?: string;
};
```

### Template customization

Part of the datagrid such as action bar, action button, expandable row space, details panel, etc... are easily customizable using angular template directives to project content in the datagrid. Here is a basic example:

- Expandable row

Use expandable rows when you have additional information for a row, or row cells that do not need to be shown at all times. This helps minimize visual clutter. It also frees up the need of a second datagrid that gets updated with details.

**Note**
To activate the expandable row developpers are required to pass `hasExpandableRows:true` to the datagrid configuration and inject the expandable row template as follow:

```html
<div class="container__clr-smart-grid">
  <ngx-clr-smart-grid
    [columns]="columns"
    [data]="individuals"
    [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasExpandableRows: true,
    }"
    (dgRefresh)="onDgRefresh($event)"
    (selectedChange)="onSelectedChanges($event)"
  >
    <ng-template #dgRowDetail let-item>
      <pre>Expandable row content!</pre>
    </ng-template>
  </ngx-clr-smart-grid>
</div>
```

- Datagrid detail pane

The Detail Pane is a pattern to show additional details for a record. The Detail Pane condenses the datagrid to show a primary column and a panel to the right to display more details about your record. The Detail Paine allows you to show the full content of the record in a larger scrollable space. The Detail Pane is also fully accessible for keyboard and screen reader users.

**Note**
To activate the details pane developpers are required to pass `hasDetails:true` to the datagrid configuration and inject the detail pane template as follow:

```html
<div class="container__clr-smart-grid">
  <ngx-clr-smart-grid
    [columns]="columns"
    [data]="individuals"
    [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasDetails: true,
    }"
    (dgRefresh)="onDgRefresh($event)"
    (selectedChange)="onSelectedChanges($event)"
  >
    <ng-template #dgDetailBody let-item>
      <div class="dg-detail-header">Detail Pane Header!</div>
      <pre>{{ item | json }}</pre>
    </ng-template>
  </ngx-clr-smart-grid>
</div>
```

- Datagrid action bar

Action bar provide way to add action buttons on top of the datagrid that allow to perform batch operation or operation not particular to a single element but to the datagrid as whole.

```html
<!-- THe example show full datagrid configuration and customization that can be used. Feel free to copy and modify required values -->
<div class="container__clr-smart-grid">
  <ngx-clr-smart-grid
    [columns]="columns"
    [data]="individuals"
    [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
    }"
    (dgRefresh)="onDgRefresh($event)"
    (selectedChange)="onSelectedChanges($event)"
  >
    <!-- Action bar -->
    <ng-template #dgActionBar let-selected>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-outline">
          <clr-icon shape="plus"></clr-icon>
          Add to group
        </button>
        <button type="button" class="btn btn-sm btn-outline">
          <clr-icon shape="close"></clr-icon>
          Delete
        </button>
        <button type="button" class="btn btn-sm btn-outline" *ngIf="selected">
          <clr-icon shape="pencil"></clr-icon>
          Edit
        </button>
      </div>
    </ng-template>
  </ngx-clr-smart-grid>
</div>
```

- Overflow actions

Overflow action are designed for single selected row. They allow developper to customize actions on single selected row in the datagrid template.

**Note**
To activate the action overflow for datagrid rows developpers are required to pass `hasActionOverflow:true` to the datagrid configuration and inject the overflow template as follow:

```html
<!-- THe example show full datagrid configuration and customization that can be used. Feel free to copy and modify required values -->
<div class="container__clr-smart-grid">
  <ngx-clr-smart-grid
    [columns]="columns"
    [data]="individuals"
    [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasActionOverflow: true,
    }"
    (dgRefresh)="onDgRefresh($event)"
    (selectedChange)="onSelectedChanges($event)"
  >
    <ng-template #dgActionOverflow let-item>
      <button class="action-item">{{ item['firstname'] }}</button>
      <button class="action-item">Edit</button>
    </ng-template>
  </ngx-clr-smart-grid>
</div>
```

- Styling

Styling datagrid consist of applying css classes and style to the datagrid as whole or data colum (cell) in particular. Styles are configured in the typescript file when creating columns template for the datagrid. An example can be found below:

```ts
@Component({})
export class AppComponent {
  // Datagrid columns configuration
  public columns: GridColumnType[] = [
    {
      title: "Nom",
      label: "lastname",
    },
    {
      title: "Prénoms",
      label: "firstname",
    },
    {
      title: "Test",
      label: "test",
      transform: "testPipe",
      style: {
        // The list of provided css classes that will be applied to the datagrid
        class: "label label-success p-top-bottom-12",
      },
    },
  ];
}
```

To apply Css styles:

```ts
@Component({

})
export class AppComponent {

  // Datagrid columns configuration
  public columns: GridColumnType[] = [
    {
      title: 'Nom',
      label: 'lastname',
    },
    {
      title: 'Prénoms',
      label: 'firstname',
      style: {
        styles: [
          'display: block;',
          'box-sizing: border-box'
        ]
        // or using string
        styles: 'display: block; box-sizing: border-box'
      }
    },
    {
      title: 'Test',
      label: 'test',
      transform: 'testPipe',
      style: {
        // The list of provided css classes that will be applied to the datagrid
        class: 'label label-success p-top-bottom-12'
      }
    }
  ];
}
```

**Note**
The datagrid support a class property that can be set during configuration of the grid:

```html
// app.component.html
<!-- Code -->
<!-- configure the smart grid using basic configurations -->
<ngx-clr-smart-grid
  [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      class: 'clr-dg-compact custom-style-1 custom-style-2'
    }"
  (dgRefresh)="onDgRefresh($event)"
  (selectedChange)="onSelectedChanges($event)"
>
</ngx-clr-smart-grid>
```

- Projecting row class

Projecting row class allow developpers to set or apply a `css class` to a datagrid row element, using a simple javascript function or string value.

```ts
@Component({
  // ...
  template: `
    <ngx-clr-smart-grid
      [config]="gridConfig"
      (dgRefresh)="onDgRefresh($event)"
      (selectedChange)="onSelectedChanges($event)"
    >
    </ngx-clr-smart-grid>
  `,
})
export class MyComponent {
  gridConfig: Partial<GridConfigType> = {
    class: "clr-dg-compact custom-style-1 custom-style-2",
    // Below we use a Javascript function to apply a class to the datagrid row based on the row value
    projectRowClass: (current: any) => {
      return current.id === 3 ? "my-row" : "";
    },

    // or using a simple javascript string
    // projectRowClass: 'my-row sticky'
  };
}
```
