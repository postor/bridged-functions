export type FnMap = Record<string, (...args: any[]) => any>;

export type ReservedKeys = '$register' | '$deRegister';

export type NonReservedKeys<T extends FnMap> = Exclude<keyof T, ReservedKeys>;

export type Bridge<T extends FnMap> = {
  $register<K extends NonReservedKeys<T>>(name: K, fn: T[K]): () => void;
  $deRegister<K extends NonReservedKeys<T>>(name: K, fn: T[K]): void;
} & {
  [K in NonReservedKeys<T>]: T[K];
};
