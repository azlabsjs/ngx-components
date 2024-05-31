import {
  PIPE_TRANSFORMS,
  PipeTransformTokenMapType,
} from '@azlabsjs/ngx-common';

/** @description Provide List of pipes that will be dynamically used by the gid component to transform values */
// TODO: Move this into ngx-common module
export function providePipes(config: {
  pipes: PipeTransformTokenMapType;
  debug?: boolean;
}) {
  return {
    provide: PIPE_TRANSFORMS,
    useFactory: () => {
      let { pipes } = config ?? {};
      return pipes ?? {};
    },
  };
}
