import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable, Injector, Type } from '@angular/core';

/**
 * Simplified DrawerService ported from FA-Suite core/services/drawer.service.ts.
 * Uses CDK Overlay to dynamically create drawer components, avoiding @if change detection loops.
 */
@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly openDrawers = new Map<Type<any>, OverlayRef>();

  open<T>(component: Type<T>, data?: Partial<T>, onClose?: (result?: any) => void): ComponentRef<T> {
    const overlayRef = this.overlay.create({
      hasBackdrop: false,
      panelClass: 'drawer-overlay-panel',
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal(component, null, this.injector);
    const componentRef = overlayRef.attach(portal);

    if (data) {
      Object.assign(componentRef.instance, data);
    }

    // Listen for close output from the component
    if ((componentRef.instance as any).close) {
      (componentRef.instance as any).close.subscribe((result?: any) => {
        this.close(component);
        onClose?.(result);
      });
    }

    this.openDrawers.set(component, overlayRef);

    overlayRef.detachments().subscribe(() => {
      this.openDrawers.delete(component);
      componentRef.destroy();
    });

    return componentRef;
  }

  close<T>(component: Type<T>): void {
    const overlayRef = this.openDrawers.get(component);
    if (overlayRef) {
      overlayRef.dispose();
      this.openDrawers.delete(component);
    }
  }
}
