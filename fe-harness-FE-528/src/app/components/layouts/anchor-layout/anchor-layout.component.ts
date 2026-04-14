import { Component, input } from '@angular/core';
import { AnchorLink } from './anchor-link.interface';

/**
 * Simplified anchor layout with sticky sidebar navigation and scrollable content.
 * Harness version of FA-Suite's AnchorLayoutComponent.
 */
@Component({
  selector: 'app-anchor-layout',
  standalone: true,
  templateUrl: './anchor-layout.component.html',
  styleUrl: './anchor-layout.component.scss',
})
export class AnchorLayoutComponent {
  /** Anchor links displayed in the sidebar. */
  public readonly anchorLinks = input<AnchorLink[]>([]);

  /** Scrolls to the element matching the given fragment ID. */
  scrollTo(fragment: string): void {
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
