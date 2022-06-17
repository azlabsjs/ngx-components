import { DropzoneConfig } from '../types';

const isDeepObject = (value: any) =>
  typeof value !== 'undefined' &&
  value !== null &&
  !Array.isArray(value) &&
  typeof value === 'object' &&
  !(value instanceof HTMLElement);

/**
 * @description Creates an instance of Dropzone configuration
 *
 * @param config
 * @param target
 */
export const createDzConfig = (
  config: DropzoneConfig | any = {},
  target?: any
) => {
  target = target || ({} as DropzoneConfig);
  for (const key in config) {
    if (
      typeof config !== 'undefined' &&
      config !== null &&
      isDeepObject(config[key])
    ) {
      target[key] = createDzConfig(config[key], {});
    } else {
      target[key] = config[key];
    }
  }
  return target as DropzoneConfig;
};

/**
 * @description Merged dz component accepted files input dictionary parameter
 * into dropzone configuration object
 *
 * @param config
 * @param accepted
 */
export function mergeDzAcceptFiles(
  config: DropzoneConfig,
  accepted: string = 'images'
) {
  return {
    ...config,
    // tslint:disable-next-line:ban-types
    accept: (file: File, done: Function) => {
      let matches = false;
      if (
        config.acceptedFiles === null ||
        typeof config.acceptedFiles === 'undefined' ||
        config.acceptedFiles === '*'
      ) {
        matches = true;
      } else if (
        config.acceptedFiles !== null &&
        typeof config.acceptedFiles !== 'undefined' &&
        config.acceptedFiles?.indexOf(',') !== -1
      ) {
        let types: string[] = config?.acceptedFiles?.split(',') ?? [];
        types = types?.filter((type) => file.type.match(type));
        matches = types?.length !== 0 ? true : false;
      } else {
        matches = config.acceptedFiles
          ? file.type.match(config.acceptedFiles)?.length !== 0
          : true;
      }
      if (!matches) {
        done(`${config!.dictAcceptedFiles || ''} ${accepted}`);
      } else {
        done();
      }
    },
  } as DropzoneConfig;
}
