# bridged-functions

Type-safe function overrides with defaults, using a stack-based callback system.
Allows registering multiple overrides per function key, always calling the latest override, falling back to the default if none registered. Supports deregistering in any order.

## Why This Project

In many applications, especially those outside of React environments, managing and invoking top-level hook functions can become complex and scattered. This project was created to simplify calling such hook functions in a non-React context by providing a lightweight, type-safe mechanism to register, override, and deregister functions dynamically.

Unlike React’s built-in hook system, this solution works independently of any framework, making it ideal for scenarios where you want flexible control over function overrides without the overhead of event emitters or complex state management. It enables clean separation of default behavior and temporary or conditional overrides, while ensuring consistent and predictable invocation order.

This makes it perfect for plugin architectures, middleware systems, or any environment where you want to easily swap or augment core logic at runtime without coupling tightly to React or other UI libraries.


---

## Features

* Strong TypeScript typing — IDE checks callback signatures and keys.
* Default implementations guaranteed and always fallback-safe.
* Supports multiple overrides stacked per function key.
* Deregistration works even if called out of order.
* No external dependencies, minimal runtime overhead.
* Simple API: `$register` and `$deRegister` to override and remove handlers.

---

## Installation

```bash
npm install bridged-functions
```

or with yarn

```bash
yarn add bridged-functions
```

---

## Usage

```ts
import { createBridge } from 'bridged-functions';

const bus = createBridge({
  fn1: async (num: number, str: string) => `${num},${str}`,
  fn2: () => new Promise(resolve => setTimeout(resolve, 500)),
});

// Use default fn1
const defaultResult = await bus.fn1(42, 'hello');  // "42,hello"

// Register an override for fn1
const deregister = bus.$register('fn1', (num, str) => `${str}-${num}`);

// Now calls use the override
const overriddenResult = await bus.fn1(42, 'hello');  // "hello-42"

// Deregister override (can call returned function or use $deRegister)
deregister();

// Back to default
const fallbackResult = await bus.fn1(42, 'hello');  // "42,hello"
```

---

## API

### `createBridge(defaults)`

Creates a bridged function object from a map of default implementations.

* `defaults`: An object mapping function names to their default implementations.
* Returns an object containing:

  * Each function key callable with its arguments, always calling the latest registered override or the default if none.
  * `$register(name, fn)`: Registers an override callback for a given function name. Returns a deregister function.
  * `$deRegister(name, fn)`: Removes a previously registered override callback for a function name. If multiple callbacks exist, removes the matching one regardless of order.

---

## When to use

* You want default implementations but allow runtime overrides of specific functions.
* Multiple modules/plugins might override the same function temporarily and deregister in any order.
* Strong TypeScript typing of function signatures is important to prevent mistakes.
* You want a minimal dependency, lightweight "function bus" for managing override chains.
* You want simple, stack-based override semantics with easy deregistration.

---

## Notes

* Function names `$register` and `$deRegister` are reserved and cannot be used as keys.
* The first registered callback for each function is always the default and cannot be deregistered.
* Overrides are stored as a stack; the latest registered callback is always called.
* Deregistration removes the matching callback from anywhere in the stack, supporting out-of-order removals.

---

## Development

* Source code in `src/` written in TypeScript.
* Tests in `tests/` run via `ts-jest` for runtime and typing validation.

---

## License

MIT License
