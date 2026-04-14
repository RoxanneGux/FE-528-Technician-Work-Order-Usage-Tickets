import { Component, EventEmitter, HostListener, Output } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  template: ''
})
export class BaseDialogComponent {
  @Output() close = new EventEmitter<any>();

  onBackdropClick(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
