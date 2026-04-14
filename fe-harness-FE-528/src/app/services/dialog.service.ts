import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, Type, inject, ComponentRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(EnvironmentInjector);
  private readonly openDialogs = new Map<Type<any>, { componentRef: ComponentRef<any>, element: HTMLElement }>();

  open<T>(
    component: Type<T>,
    data?: Partial<T>,
    onClose?: (result?: any) => void
  ): ComponentRef<T> {
    const componentRef = createComponent(component, {
      environmentInjector: this._injector
    });

    if (data) {
      Object.assign(componentRef.instance as object, data);
    }

    const instance = componentRef.instance as any;
    if (instance.close) {
      instance.close.subscribe((result: any) => {
        onClose?.(result);
        this.close(component);
      });
    }

    this._appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    this.openDialogs.set(component, { componentRef, element: domElem });

    return componentRef;
  }

  close<T>(component: Type<T>): void {
    const dialogInfo = this.openDialogs.get(component);
    if (dialogInfo) {
      this._appRef.detachView(dialogInfo.componentRef.hostView);
      dialogInfo.componentRef.destroy();
      if (dialogInfo.element.parentNode) {
        dialogInfo.element.parentNode.removeChild(dialogInfo.element);
      }
      this.openDialogs.delete(component);
    }
  }
}
