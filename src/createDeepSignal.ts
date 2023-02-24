import type { Accessor, createSignal, Setter } from 'solid-js'
import { Signal } from 'solid-js'

/**
 * - Before: `"propName"`
 * - After:  `"setPropName"`
 */
export type SetterName<T extends string> = `set${Capitalize<T>}`

/**
 * - Before: `{ a: number, b: string }`
 * - After:  `{ a: Accessor<number>, b: Accessor<string> }`
 */
export type MapAccessor<T> = {
  [Property in keyof T]: Accessor<T[Property]>
}

/**
 * - Before: `{ a: number, b: string }`
 * - After:  `{ setA: Setter<number>, setB: Setter<string> }`
 */
export type MapSetter<T> = {
  [Property in keyof T & string as SetterName<Property>]: Setter<T[Property]>
}

export type DeepMapAccessor<T> = {
  [Property in keyof T]-?: T[Property] extends object
    ? Accessor<DeepSignal<T[Property]>>
    : Accessor<T[Property]>
}

export type DeepMapSetter<T> = {
  [Property in keyof T &
    string as SetterName<Property>]-?: T[Property] extends object
    ? Setter<DeepMapSetter<T[Property]>>
    : Setter<T[Property]>
}

export type MapSignal<T> = MapAccessor<T> & MapSetter<T>

export type DeepSignal<T> = DeepMapAccessor<T> & DeepMapSetter<T>

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export function createShallowSignal<T>(initialValue: T): Signal<MapSignal<T>> {
  if (!initialValue) return createSignal<MapSignal<T>>()

  return createSignal<MapSignal<T>>(
    Object.entries(initialValue)
      .map(([key, value]) => {
        const [signal, setSignal] = createSignal<typeof value>(value)
        return {
          [key]: signal,
          [`set${capitalize(key)}`]: setSignal,
        }
      })
      .reduce((acc, curr) => Object.assign(acc, curr), {}) as MapSignal<T>
  )
}

export function createDeepSignal<T>(initialValue: T): Signal<DeepSignal<T>> {
  return createSignal<DeepSignal<T>>(
    Object.entries(initialValue)
      .map(([key, value]) => {
        let signal: Accessor<any>
        let setSignal: Setter<any>

        if (typeof value === 'object')
          [signal, setSignal] = createDeepSignal(value)
        else [signal, setSignal] = createSignal<typeof value>(value)

        return {
          [key]: signal,
          [`set${capitalize(key)}`]: setSignal,
        }
      })
      .reduce((acc, curr) => Object.assign(acc, curr), {}) as DeepSignal<T>
  )
}
