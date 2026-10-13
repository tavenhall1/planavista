/**
 * The last few check-offs, each by the toast that offered its Undo
 * (milestone 8). A toast's Undo then undoes its own check-off even after a
 * newer one, instead of doing nothing.
 */
export class RecentCheckoffs<T> {
  private readonly _byToast = new Map<string, T>();

  constructor(private readonly _keep = 5) {}

  remember(toast: string, checkoff: T): void {
    this._byToast.set(toast, checkoff);
    while (this._byToast.size > this._keep) this._byToast.delete(this._byToast.keys().next().value as string);
  }

  /** The check-off a toast offered, without forgetting it (Someone else did it? still needs it). */
  peek(toast: string): T | undefined {
    return this._byToast.get(toast);
  }

  /** The check-off a toast offered, forgotten once its Undo is used. */
  take(toast: string): T | undefined {
    const checkoff = this._byToast.get(toast);
    this._byToast.delete(toast);
    return checkoff;
  }
}
