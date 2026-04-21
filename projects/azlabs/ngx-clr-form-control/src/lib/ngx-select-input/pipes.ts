import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'thunk',
  standalone: true,
  pure: true,
})
export class Thunk implements PipeTransform {
  transform<F extends (...args: any[]) => any>(
    value: F,
    ...params: Parameters<F>| never[]
  ): () => ReturnType<F> {
    return (...args: any) => value(...params, ...args);
  }
}