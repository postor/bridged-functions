"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importDefault(require("../src"));
describe('bridged-functions', () => {
    let bridge;
    beforeEach(() => {
        bridge = (0, src_1.default)({
            fn1: async (num, str) => `${num},${str}`,
            fn2: () => new Promise((resolve) => setTimeout(resolve, 10)),
        });
    });
    test('calls default when no override', async () => {
        const result = await bridge.fn1(1, 'a');
        expect(result).toBe('1,a');
    });
    test('calls latest registered function', async () => {
        const cb = jest.fn().mockImplementation((num, str) => `${str}-${num}`);
        bridge.$register('fn1', cb);
        const result = await bridge.fn1(2, 'b');
        expect(result).toBe('b-2');
        expect(cb).toHaveBeenCalledWith(2, 'b');
    });
    test('deregister falls back to previous function', async () => {
        const cb1 = jest.fn().mockImplementation((num, str) => `cb1:${str}-${num}`);
        const cb2 = jest.fn().mockImplementation((num, str) => `cb2:${str}-${num}`);
        bridge.$register('fn1', cb1);
        bridge.$register('fn1', cb2);
        expect(await bridge.fn1(3, 'c')).toBe('cb2:c-3');
        bridge.$deRegister('fn1', cb2);
        expect(await bridge.fn1(4, 'd')).toBe('cb1:d-4');
        bridge.$deRegister('fn1', cb1);
        expect(await bridge.fn1(5, 'e')).toBe('5,e'); // default
    });
    test('only removes latest if matches (previous behavior)', async () => {
        const cb1 = jest.fn().mockImplementation((num, str) => `cb1:${str}-${num}`);
        const cb2 = jest.fn().mockImplementation((num, str) => `cb2:${str}-${num}`);
        bridge.$register('fn1', cb1);
        bridge.$register('fn1', cb2);
        // attempt to deregister cb1 (not top of stack)
        bridge.$deRegister('fn1', cb1);
        expect(await bridge.fn1(6, 'f')).toBe('cb2:f-6');
    });
    test('deregister works even if wrong order', async () => {
        const cb1 = jest.fn().mockImplementation((n, s) => `cb1:${s}-${n}`);
        const cb2 = jest.fn().mockImplementation((n, s) => `cb2:${s}-${n}`);
        const cb3 = jest.fn().mockImplementation((n, s) => `cb3:${s}-${n}`);
        bridge.$register('fn1', cb1);
        bridge.$register('fn1', cb2);
        bridge.$register('fn1', cb3);
        // remove cb2 out of order
        bridge.$deRegister('fn1', cb2);
        // cb3 should still be top
        expect(await bridge.fn1(1, 'x')).toBe('cb3:x-1');
        // remove cb3
        bridge.$deRegister('fn1', cb3);
        // should now fall back to cb1
        expect(await bridge.fn1(2, 'y')).toBe('cb1:y-2');
    });
    test('using returned deregister function works', async () => {
        const cb = jest.fn().mockImplementation((n, s) => `cb:${s}-${n}`);
        const deregister = bridge.$register('fn1', cb);
        expect(await bridge.fn1(10, 'z')).toBe('cb:z-10');
        deregister();
        expect(await bridge.fn1(11, 'z')).toBe('11,z'); // back to default
    });
});
