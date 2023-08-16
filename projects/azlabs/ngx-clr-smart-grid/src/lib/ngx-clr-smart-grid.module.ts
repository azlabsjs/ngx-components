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
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { NgxClrGridSelectDirective } from './directives';
import { NgxClrSmartGridComponent } from './ngx-clr-smart-grid.component';
import {
  NgxCommonModule,
  PIPE_TRANSFORMS,
  PipeTransformTokenMapType,
} from '@azlabsjs/ngx-common';

@NgModule({
  declarations: [NgxClrSmartGridComponent, NgxClrGridSelectDirective],
  imports: [CommonModule, ClarityModule, NgxCommonModule],
  exports: [
    NgxClrSmartGridComponent,
    NgxClrGridSelectDirective,
    NgxCommonModule,
    ClarityModule,
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
