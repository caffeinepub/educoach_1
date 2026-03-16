import { createActorWithConfig } from "../config";
import type { backendInterface } from "../backend";

let _instance: backendInterface | null = null;
let _initPromise: Promise<backendInterface> | null = null;

function init(): Promise<backendInterface> {
  if (_instance) return Promise.resolve(_instance);
  if (!_initPromise) {
    _initPromise = createActorWithConfig().then((actor) => {
      _instance = actor;
      return actor;
    });
  }
  return _initPromise;
}

// Proxy that auto-initializes on first method call
export const backend = new Proxy({} as backendInterface, {
  get(_target, prop) {
    return async (...args: unknown[]) => {
      const instance = await init();
      return (instance[prop as keyof backendInterface] as (...a: unknown[]) => unknown)(...args);
    };
  },
});
