import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'

describe('./type-assert.ts', () => {
  describe('hasProperty', () => {
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('(%p, "foo") returns false', (obj: unknown) =>
      expect(hasProperty(obj, 'foo')).toBe(false)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('({ foo: %p }, "foo") returns true', (foo: unknown) =>
      expect(hasProperty({ foo }, 'foo')).toBe(true)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('({ foo: %p }, "foo", "bar") returns false', (foo: unknown) =>
      expect(hasProperty({ foo }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      [undefined, undefined],
      [null, null],
      [true, false],
      [1.5, NaN],
      ['foo', 'bar'],
      [{}, {}],
      [[], []],
      [{ foo1: 'bar' }, { foo2: 'bar' }],
    ])(
      '({ foo: %p, bar: %p }, "foo", "bar") returns true',
      (foo: unknown, bar: unknown) =>
        expect(hasProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
    )
    test.each([
      [undefined, undefined],
      [null, null],
      [true, false],
      [1.5, NaN],
      ['foo', 'bar'],
      [{}, {}],
      [[], []],
      [{ foo1: 'bar' }, { foo2: 'bar' }],
    ])(
      '({ foo: %p, bar: %p }, "foo") returns true',
      (foo: unknown, bar: unknown) =>
        expect(hasProperty({ foo, bar }, 'foo')).toBe(true)
    )
  })
  describe('hasStringProperty', () => {
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('(%p, "foo") returns false', (obj: unknown) =>
      expect(hasStringProperty(obj, 'foo')).toBe(false)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      {},
      [],
      { foo1: 'bar' },
    ])('({ foo: %p }, "foo") returns false', (foo: Exclude<unknown, string>) =>
      expect(hasStringProperty({ foo }, 'foo')).toBe(false)
    )
    test.each(['', 'foo', 'bar'])(
      '({ foo: %p }, "foo") returns true',
      (foo: string) => expect(hasStringProperty({ foo }, 'foo')).toBe(true)
    )
    test.each(['', 'foo', 'bar'])(
      '({ foo: %p }, "foo", "bar") returns false',
      (foo: string) =>
        expect(hasStringProperty({ foo }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      {},
      [],
      { foo1: 'bar' },
    ])(
      '({ foo: "foo", bar: %p }, "foo", "bar") returns false',
      (bar: Exclude<unknown, string>) =>
        expect(hasStringProperty({ foo: 'foo', bar }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      ['', ''],
      ['foo', 'bar'],
    ])(
      '({ foo: %p, bar: %p }, "foo", "bar") returns true',
      (foo: string, bar: string) =>
        expect(hasStringProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      {},
      [],
      { foo1: 'bar' },
    ])(
      '({ foo: "foo", bar: %p }, "foo") returns true',
      (bar: Exclude<unknown, string>) =>
        expect(hasStringProperty({ foo: 'foo', bar }, 'foo')).toBe(true)
    )
  })
  describe('hasIntegerProperty', () => {
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('(%p, "foo") returns false', (obj: unknown) =>
      expect(hasIntegerProperty(obj, 'foo')).toBe(false)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      NaN,
      Infinity,
      -Infinity,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('({ foo: %p }, "foo") returns false', (foo: unknown) =>
      expect(hasIntegerProperty({ foo }, 'foo')).toBe(false)
    )
    test.each([0, -0, 1, -1])(
      '({ foo: %p }, "foo") returns true',
      (foo: number) => expect(hasIntegerProperty({ foo }, 'foo')).toBe(true)
    )
    test.each([0, -0, 1, -1])(
      '({ foo: %p }, "foo", "bar") returns false',
      (foo: number) =>
        expect(hasIntegerProperty({ foo }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      undefined,
      null,
      true,
      1.5,
      NaN,
      Infinity,
      -Infinity,
      'foo',
      {},
      [],
      { foo1: 'bar' },
    ])('({ foo: 1, bar: %p }, "foo", "bar") returns false', (bar: unknown) =>
      expect(hasIntegerProperty({ foo: 1, bar }, 'foo', 'bar')).toBe(false)
    )
    test.each([
      [0, -0],
      [1, -1],
    ])(
      '({ foo: %p, bar: %p }, "foo", "bar") returns true',
      (foo: unknown, bar: unknown) =>
        expect(hasIntegerProperty({ foo, bar }, 'foo', 'bar')).toBe(true)
    )
  })
})
