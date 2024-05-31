import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { PIPE_TRANSFORMS, PipeTransformTokenMapType } from './pipes/transform';
import { COMMON_PIPES } from './pipes';

/** @deprecated To use the common custom directives and pipes simply import the exported `COMMON_PIPES` constant  */
@NgModule({
  imports: [CommonModule, ...COMMON_PIPES],
  exports: [CommonModule, ...COMMON_PIPES],
})
export class NgxCommonModule {
  /** @deprecated Use `providePipes(...)` in your module or component to register custom pipes */
  static forRoot(config: {
    pipeTransformMap: PipeTransformTokenMapType;
  }): ModuleWithProviders<NgxCommonModule> {
    let { pipeTransformMap } = config ?? {};
    pipeTransformMap = pipeTransformMap ?? {};
    const pipeTransformProvider = Object.keys(pipeTransformMap)
      .map((key) => pipeTransformMap[key])
      .filter((item) => typeof item !== 'undefined' && item !== null);
    return {
      ngModule: NgxCommonModule,
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
