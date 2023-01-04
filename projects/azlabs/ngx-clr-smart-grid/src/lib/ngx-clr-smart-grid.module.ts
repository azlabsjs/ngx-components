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
import {
  ModuleWithProviders,
  NgModule
} from '@angular/core';
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
    debug?: boolean;
  }): ModuleWithProviders<NgxClrSmartGridModule> {
    let { pipeTransformMap } = config ?? {};
    pipeTransformMap = pipeTransformMap ?? {};
    let pipeTransformProvider = Object.keys(pipeTransformMap)
      .map((key) => pipeTransformMap[key])
      .filter((item) => typeof item !== 'undefined' && item !== null);
    return {
      ngModule: NgxClrSmartGridModule,
      providers: [
        ...pipeTransformProvider,
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
