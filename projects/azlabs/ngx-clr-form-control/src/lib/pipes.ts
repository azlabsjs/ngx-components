import { Pipe, PipeTransform } from '@angular/core';
import { FileInput } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'accept',
  pure: true,
  standalone: true,
})
export class AcceptFilePipe implements PipeTransform {
  transform(config: FileInput) {
    if (config?.constraints?.pattern?.fn) {
      if (typeof config?.constraints?.pattern?.fn === 'string') {
        return config?.constraints?.pattern?.fn.split(',').map((x) => x.trim());
      }
    }
    return config.pattern ? config.pattern.split(',').map((x) => x.trim()) : [];
  }
}

// exported standalone pipes
export const PIPES = [AcceptFilePipe] as const;
