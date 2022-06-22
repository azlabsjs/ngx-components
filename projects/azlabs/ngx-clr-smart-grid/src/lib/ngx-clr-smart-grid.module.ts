import {
  AsyncPipe,
  CommonModule,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import { NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { NgxClrGridSelectDirective } from './directives';
import { NgxClrSmartGridComponent } from './ngx-clr-smart-grid.component';
import { NgxGridDataPipe } from './pipes';

@NgModule({
  declarations: [
    NgxClrSmartGridComponent,
    NgxGridDataPipe,
    NgxClrGridSelectDirective,
  ],
  imports: [CommonModule, ClarityModule],
  exports: [
    NgxClrSmartGridComponent,
    NgxGridDataPipe,
    NgxClrGridSelectDirective,
  ],
  providers: [
    UpperCasePipe,
    LowerCasePipe,
    CurrencyPipe,
    DecimalPipe,
    JsonPipe,
    PercentPipe,
    SlicePipe,
    AsyncPipe,
  ],
})
export class NgxClrSmartGridModule {}
