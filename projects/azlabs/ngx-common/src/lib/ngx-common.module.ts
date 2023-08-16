import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  NgxTransformPipe,
  PIPE_TRANSFORMS,
  PipeTransformTokenMapType,
} from './pipes/transform';
import { CommonStringsPipe } from './pipes/common-strings';

@NgModule({
  declarations: [NgxTransformPipe, CommonStringsPipe],
  imports: [CommonModule],
  exports: [CommonModule, NgxTransformPipe, CommonStringsPipe],
})
export class NgxCommonModule {
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
