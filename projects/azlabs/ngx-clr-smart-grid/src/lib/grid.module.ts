import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  PIPE_TRANSFORMS,
  PipeTransformTokenMapType,
} from '@azlabsjs/ngx-common';
import { DIRECTIVES } from './common';

/** @deprecated use exported `DIRECTIVES` array to use the exported directives */
@NgModule({
  imports: [...DIRECTIVES],
  exports: [...DIRECTIVES],
})
export class NgxClrSmartGridModule {
  /** @deprecated */
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
