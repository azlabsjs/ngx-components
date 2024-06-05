# NgxIntlTelInput

The `ngx-intl-tel-input` library provide angular UI component for redenring ISO3166 compatible phone input element.

## Dependencies

| @azlabsjs/ngx-intl-tel-input | @azlabsjs/@azlabsjs/ngx-dropdown | Angular |
| ---------------------------- | -------------------------------- | ------- |
| ^0.15.x                      | ^0.15.0                          | ^15.0   |
| ^0.16.x                      | ^0.16.0                          | ^15.0   |

## Usage

To use the the `ngx-intl-tel-input` component in your application, you must import the it module in the root of your angular application:

```ts
import { NgxIntlTelInputModule } from "@azlabsjs/ngx-intl-tel-input";

@NgModule({
  // ...
  imports: [NgxIntlTelInputModule],
})
export class AppModule {}
```

By default the library will create load a list of default `ISO3166` countries when using the `intl-input-component`. To override the default countries :

```ts
import { NgxIntlTelInputModule } from "@azlabsjs/ngx-intl-tel-input";

@NgModule({
  // ...
  imports: [
    NgxIntlTelInputModule.forRoot({
      countries: [
        {
          name: "Togo",
          iso2: "tg",
          dialCode: "+228",
        },
        {
          name: "Ghana",
          iso2: "gh",
          dialCode: "+233",
        },
      ],
    }),
  ],
})
export class AppModule {}
```

- Using the component in angular templates

To use the `ngx-intl-tel-input` in your angular template:

```html
<ngx-intl-tel-input *ngIf="control" (error)="onError($event)" (valueChange)="control.setValue($event)" [value]="state.value ?? ''" (blur)="onBlur($event)" (focus)="onFocus($event)" [class]="cssClass" [required]="true" [preferredCountries]="['tg', 'gh']" [country]="'tg'"> </ngx-intl-tel-input>
```

**Note** The library comes with a default `html input` element which for user input action. To override the default input, developpers use angular content projection API as follow:

```html
<ngx-intl-tel-input *ngIf="control" (error)="onError($event)" (valueChange)="onValueChange($event)" [value]="state.value ?? ''" (blur)="onBlur($event)" (focus)="onFocus($event)" [class]="cssClass" [required]="config!.rules?.isRequired || false" [preferredCountries]="['tg', 'gh']" [country]="'tg'">
  <ng-template #input let-keypress="keypress" let-selected="selected" let-change="change" let-required="required" let-disabled="disabled" let-value="value">
    <input type="text" (keypress)="keypress" (change)="change" [required]="required" [disabled]="disabled" [value]="value" />
  </ng-template>
</ngx-intl-tel-input>
```

## API version > 0.15.30 changes

From version `0.15.30`, NgxIntlTelInputModule is marked as deprecated for update to standalone component.
The `NgxIntlTelInputComponent` is marked standalone and can now be directly imported in your modules.

The library now also comes with some providers that allow application developpers to globally register supported countries and preferred countries on the intel input element.

To override the default provided list of countries, simply add at the root of your angular application:

```ts
import { provideSupportedCountries } from '@azlabsjs/ngx-intl-tel-input';

// app.module.ts
@NgModule({
  providers: [
    provideSupportedCountries(['tg', 'ci', 'gh']) // This only show countries TG, CI, and GH on the phone input
  ]
})
export class AppModule {
}
```

Also to provide the list of preferred countries that is shown on top of all other countries:


```ts
import { providePreferredCountries } from '@azlabsjs/ngx-intl-tel-input';

// app.module.ts
@NgModule({
  providers: [
    providePreferredCountries(['tg']) // This only show countries TG,  on top of the scrollable list
  ]
})
export class AppModule {
}
```

- Using the standalone component

Now developpers working with new angular standalone component API can directly import the `intel-tel-input`
directly in their standalone component or module as follow:

```ts

import { NgxIntlTelInputComponent } from '@azlabsjs/ngx-intl-tel-input';

@Component({
  //...
  standalone: true,
  import: [
    // ....
    NgxIntlTelInputComponent
  ]
})
export class MyComponent {

}
```