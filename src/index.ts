import { FnMap, Bridge, NonReservedKeys, ReservedKeys } from './types';

export default function createBridge<T extends FnMap>(defaults: T): Bridge<T> {
  const stacks = new Map<keyof T, T[keyof T][]>();

  const proxy: any = {};

  // initialize stacks with default callback as first element
  (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
    if ((['$register', '$deRegister'] as ReservedKeys[]).includes(key as ReservedKeys)) {
      throw new Error(`Key "${String(key)}" is reserved and cannot be used as a function name.`);
    }

    stacks.set(key, [defaults[key]]);

    proxy[key] = async (...args: any[]) => {
      const stack = stacks.get(key)!;
      const top = stack[stack.length - 1];
      return await (top as any)(...args);
    };
  });

  proxy.$register = <K extends NonReservedKeys<T>>(name: K, fn: T[K]) => {
    const stack = stacks.get(name)!;
    stack.push(fn);
    return () => proxy.$deRegister(name, fn);
  };

  proxy.$deRegister = <K extends NonReservedKeys<T>>(name: K, fn: T[K]) => {
    const stack = stacks.get(name)!;
    if (stack.length <= 1) return; // never remove default
    const idx = stack.lastIndexOf(fn);
    if (idx > 0) {
      stack.splice(idx, 1);
    }
  };

  return proxy as Bridge<T>;
}
