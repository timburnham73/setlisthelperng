import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secToMin',
  standalone: true
})
export class SecToMinPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
