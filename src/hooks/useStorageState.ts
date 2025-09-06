import { storage } from "#imports"
import { useCallback, useEffect, useMemo, useState } from "react"

/**
 * useStorageState
 *
 * @param key       不带前缀的存储键名，比如 'counter'
 * @param fallback  初始值／兜底值
 * @param area      存储区域，默认为 'local'，可选 'local' | 'session' | 'sync' | 'managed'
 * @returns         [value, setValue]，用法同 useState
 */
export function useStorageState<T>(
  key: string,
  fallback: T,
  area: "local" | "session" | "sync" | "managed" = "local"
): [T, (v: T | ((prev: T) => T)) => Promise<void>] {
  // 完整 key
  const fullKey = `${area}:${key}`

  // 定义一个 StorageItem，memoize 保证不会重复注册 watcher
  const item = useMemo(
    () =>
      storage.defineItem<T>(fullKey, {
        fallback
      }),
    [fullKey, fallback]
  )

  // 本地 state
  const [state, setState] = useState<T>(fallback)

  // 初始化读取 + 监听外部改动
  useEffect(() => {
    let alive = true

    // 先读一次最新值
    item.getValue().then((v) => {
      if (alive) {
        // 如果 storage 里已有值就覆盖初始值
        if (v !== null && v !== undefined) {
          setState(v)
        }
      }
    })

    // 监听 storage 变化，保证响应式
    const unwatch = item.watch((newValue) => {
      setState(newValue)
    })

    return () => {
      alive = false
      unwatch()
    }
  }, [item])

  // 包装一层：先更新本地 state，再写入 storage
  const setStorageState = useCallback(
    async (val: T | ((prev: T) => T)) => {
      const newVal =
        typeof val === "function" ? (val as (prev: T) => T)(state) : val

      setState(newVal)
      await item.setValue(newVal)
    },
    [item, state]
  )

  return [state, setStorageState]
}
