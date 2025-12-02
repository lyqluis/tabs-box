import type { TaskCollection, TaskWindow } from "../types/data"
import type { WrappedCollection, WrappedWindow } from "./data"

// 生成稳定哈希（使用SHA-256，可替换为其他算法）
async function generateHash(str: string) {
  // console.log("generateHash start")
  // 1. 浏览器或 Node≥19 的全局 Web Crypto
  const webCrypto =
    globalThis.crypto ??
    (globalThis as any).crypto?.webcrypto ?? // Node 17-18 挂在 webcrypto 字段
    (await import("node:crypto")).webcrypto // Node 16-

  if (webCrypto?.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await webCrypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }
}

// TODO: no need
// 生成Tab的哈希（基于URL）
async function hashTab(tab) {
  return generateHash(
    JSON.stringify({
      url: tab.url, // 可扩展其他属性如title
    }),
  )
}

// 生成Window的哈希（基于所有Tab哈希的排序组合）
async function hashWindow(window: TaskWindow) {
  // NOTE: which is better performance?
  // 1. hashTab => hashWindow
  // 2. join all urls => hashWindow
  // const tabHashes = await Promise.all(window.tabs.map(hashTab))
  // return generateHash(JSON.stringify(tabHashes.sort())) // 排序保证顺序无关
  const urls = window.raw.tabs.map((tab) => tab.raw.url).sort()
  // console.log("hashwindow - urls", urls)
  const hash = await generateHash(urls.join("|"))
  // console.log("hashwindow finished", hash)
  window.extra.hash = hash
  return hash
}

// 生成Collection的哈希（基于标题和所有Window哈希）
async function hashCollection(collection: TaskCollection) {
  // console.log("hash collection start")
  const windowHashes = await Promise.all(collection.raw.windows.map(hashWindow))
  const hash = await generateHash(
    JSON.stringify(windowHashes.sort()), // 排序保证窗口顺序无关
  )
  collection.extra.hash = hash
  return hash
}

export { hashCollection, hashWindow }
