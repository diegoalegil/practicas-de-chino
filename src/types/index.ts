/** Contrato de una vista montable en el shell de la app. */
export interface View {
  mount(root: HTMLElement): void | Promise<void>;
  unmount?(): void;
}
