import { Component, input } from '@angular/core';

@Component({
  selector: 'app-table-text-subtext',
  standalone: true,
  template: `
    <span class="title">{{ text() }}</span>
    <span class="sub-title">{{ subText() }}</span>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class TableTextSubtextComponent {
  text = input<string>('');
  subText = input<string>('');
}
