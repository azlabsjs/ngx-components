import {
  AsyncPipe,
  CommonModule,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe
} from '@angular/common';
import { NgModule } from '@angular/core';
import { AzlCachePipe, NgxAzlCacheModule } from '@azlabsjs/ngx-azl-cache';
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
  imports: [CommonModule, ClarityModule, NgxAzlCacheModule],
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
    AzlCachePipe,
  ],
})
export class NgxClrSmartGridModule {}
