import { DeepSignal } from './createDeepSignal'

type Test = DeepSignal<{
  a: {
    b: {
      c: number
    }
  }
}>

const test = ({} as Test).a().b().c().toLocaleString()
