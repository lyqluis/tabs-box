import type { readonly, Readonly, shallowReactive } from "vue"

export interface Tab {
  id: string
  title: string
  url: string
  [key: string]: unknown
}

export interface Window<T = Tab> {
  id: string
  title: string
  tabs: T[]
  [key: string]: unknown
}

export interface Collection<T = Window> {
  id: string
  title: string
  created: number
  windows: T[]
  [key: string]: unknown
}

// use in compare
export interface TaskData<T> {
  raw: T
  extra: {
    hash?: string
    conflict?: string
    added?: boolean
  }
}

export type TaskTab = TaskData<Tab>
export type TaskWindow = TaskData<Window<TaskTab>>
export type TaskCollection = TaskData<Collection<TaskWindow>>

// use in vue
export interface WrappedData<T> {
  data: Readonly<T> // 原始数据只读
  // data used in ui
  hash?: string
  checked?: boolean
  deleted?: boolean
  transferred?: boolean
  conflict?: string
  added?: boolean
}

export type WrappedTab = WrappedData<Tab> & {
  window: WrappedWindow
  windowId: WrappedWindow.data.id
}
export type WrappedWindow = WrappedData<Window> & {
  tabs: WrappedTab[]
  collection: WrappedCollection
  collectionId: WrappedCollection.data.id
  indeterminate?: boolean
}
export type WrappedCollection = WrappedData<Collection> & {
  windows: WrappedWindow[]
  indeterminate?: boolean
}

// TODO:
// format & compare stage, use {...item, extra: {hash, conflict}}
// then wrap with shallowReactive
