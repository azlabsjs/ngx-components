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
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { NgxClrGridSelectDirective } from './directives';
import { NgxClrSmartGridComponent } from './ngx-clr-smart-grid.component';
import { NgxGridDataPipe } from './pipes';
import { PIPE_TRANSFORMS } from './tokens';
import { PipeTransformTokenMapType } from './types';

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
export class NgxClrSmartGridModule {
  static forRoot(config: {
    pipeTransformMap: PipeTransformTokenMapType;
  }): ModuleWithProviders<NgxClrSmartGridModule> {
    return {
      ngModule: NgxClrSmartGridModule,
      providers: [
        {
          provide: PIPE_TRANSFORMS,
          useFactory: () => {
            return config?.pipeTransformMap ?? {};
          },
          deps: [],
        },
      ],
    };
  }
}
