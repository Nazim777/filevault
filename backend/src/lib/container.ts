/**
 * Lightweight Dependency Injection container.
 * Registers singleton service instances and resolves them by token.
 */
type Token<T> = new (...args: any[]) => T;

class Container {
  private registry = new Map<string, unknown>();

  register<T>(token: Token<T>, instance: T): void {
    this.registry.set(token.name, instance);
  }

  resolve<T>(token: Token<T>): T {
    const instance = this.registry.get(token.name);
    if (!instance) throw new Error(`[DI] Service not registered: ${token.name}`);
    return instance as T;
  }
}

export const container = new Container();
