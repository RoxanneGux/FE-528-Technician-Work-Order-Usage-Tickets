import { Component, input } from '@angular/core';
import { AwIconComponent } from '@assetworks-llc/aw-component-lib';

/** Key-value data row for the details card. */
export interface DetailsCardDataRow {
  label: string;
  value: string;
}

/**
 * Presentational card displaying an icon, title, and key-value data rows.
 * Supports content projection for custom content (e.g., Actions card buttons).
 */
@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [AwIconComponent],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.scss',
})
export class DetailsCardComponent {
  /** Material icon name. */
  public readonly icon = input.required<string>();

  /** Icon background color variant ('green', 'orange', 'blue'). */
  public readonly iconColor = input.required<string>();

  /** Card title text. */
  public readonly title = input.required<string>();

  /** Key-value data rows to display. */
  public readonly dataRows = input<DetailsCardDataRow[]>([]);
}
