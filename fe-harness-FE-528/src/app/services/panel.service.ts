import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable, Injector, Type } from '@angular/core';

/**
 * Opens full-width slide-in panels inside the nav container.
 * Ported from FA-Suite core/services/panel.service.ts.
 */
@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly openPanels = new Map<Type<any>, OverlayRef>();

  open<T extends object>(component: Type<T>, data?: Partial<T>, onClose?: (result?: any) => void, panelClass?: string): ComponentRef<T> {
    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      panelClass: panelClass || 'panel-overlay',
      positionStrategy: this.overlay.position().global().top('0').left('0').width('100%').height('100%'),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal(component, null, this.injector);
    const componentRef = overlayRef.attach(portal);

    if (data) {
      Object.assign(componentRef.instance, data);
    }

    if ((componentRef.instance as any).close) {
      (componentRef.instance as any).close.subscribe((result?: any) => {
        this.close(component);
        onClose?.(result);
      });
    }

    this.openPanels.set(component, overlayRef);
    overlayRef.detachments().subscribe(() => {
      this.openPanels.delete(component);
      componentRef.destroy();
    });

    return componentRef;
  }

  close<T extends object>(component: Type<T>): void {
    const overlayRef = this.openPanels.get(component);
    if (overlayRef) {
      overlayRef.dispose();
      this.openPanels.delete(component);
    }
  }
}
