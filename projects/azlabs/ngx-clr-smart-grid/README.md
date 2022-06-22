# Smart Grid Component

Smart grid component is an angular component, using clarity datagrid component under the hood, that is highly configurable using angular `ng-template` directive for content projection and Javascript object for columns, datagrid and data configurations.

Basically the implementation comes with a module that wrap required component and directives for the module to work. In your root application module, or any child module add this to your imports:

```ts
// app.module.ts

import { NgxClrSmartGridModule } from "@azlabsjs/ngx-clr-smart-grid";

@NgModule({
  imports: [
    // ...
    NgxClrSmartGridModule
  ]
})
export class AppModule {
}
```

Example:

At it basic usage we simply add the component to our html template as most component in Angular framework:

```html
// app.component.html
<!-- Code -->
<!-- configure the smart grid using basic configurations -->
<ngx-clr-smart-grid [columns]="columns" [data]="data" (dgRefresh)="onDgRefresh($event)" (selectedChange)="onSelectedChanges($event)">
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
      label: "lastname"
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

* Data Transformation

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

* Data grid customization

To customize the datagrid an input property is used:

```html
<ngx-clr-smart-grid [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasExpandableRows: false,
      hasDetails: true,
      selectable: true,
      singleSelection: false
    }" [columns]="columns" [data]="data" (dgRefresh)="onDgRefresh($event)" (selectedChange)="onSelectedChanges($event)">
</ngx-clr-smart-grid>
```

The Type defintion for datagrid customization is as follow:

```ts
/**
 * @description Type definition of Smart datagrid configuration
 * value
 */
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

* Template customization

Part of the datagrid such as action bar, action button, expandable row space, details panel, etc... are easily customizable using angular template directives to project content in the datagrid. Here is a basic example:

```html
<!-- THe example show full datagrid configuration and customization that can be used. Feel free to copy and modify required values -->
<div class="container__clr-smart-grid">
    <ngx-clr-smart-grid [columns]="columns" [data]="individuals" [config]="{
      sizeOptions: [5, 10, 50, 100, 150],
      pageSize: 5,
      hasExpandableRows: false,
      hasDetails: true,
      selectable: true,
      singleSelection: false
    }" (dgRefresh)="onDgRefresh($event)" (selectedChange)="onSelectedChanges($event)">
        <!-- Action bar -->
        <ng-template #dgActionBar let-selected>
            <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline">
                    <cds-icon shape="plus"></cds-icon>
                    Add to group
                </button>
                <button type="button" class="btn btn-sm btn-outline">
                    <cds-icon shape="close"></cds-icon>
                    Delete
                </button>
                <button type="button" class="btn btn-sm btn-outline" *ngIf="selected">
                    <cds-icon shape="pencil"></cds-icon>
                    Edit
                </button>
            </div>
        </ng-template>
        <!-- Overflow action for button acting on a single row -->
        <ng-template #dgActionOverflow let-item>
            <button class="action-item">{{ item['firstname'] }}</button>
        </ng-template>
        <!-- Data grid row details -->
        <ng-template #dgRowDetail let-item>
            <pre>Row Details!</pre>
        </ng-template>
        <!-- Data grid row element detail panel -->
        <ng-template #dgDetailBody let-item>
            <div class="dg-detail-header">Detail Pane Header!</div>
            <pre>{{ item | json }}</pre>
        </ng-template>
    </ngx-clr-smart-grid>
</div>
```
