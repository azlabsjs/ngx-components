import { PIPE_TRANSFORMS, PipeTransformTokenMapType } from './pipes/transform';

/**
 * @description Provide List of pipes that will be dynamically used by the gid component to transform values.
 *
 * **Note** Your registered pipe should be declared with `@Injectable({provideIn: 'root'})` or `@Injectable({provideIn: 'any'})` for the injector
 *          to be able to resolve them
 */
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
