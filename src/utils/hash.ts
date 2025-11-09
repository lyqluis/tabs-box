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
async function hashTab(tab: Tab) {
  return generateHash(
    JSON.stringify({
      url: tab.url, // 可扩展其他属性如title
    }),
  )
}

// 生成Window的哈希（基于所有Tab哈希的排序组合）
async function hashWindow(window: Window) {
  // NOTE: which is better performance?
  // 1. hashTab => hashWindow
  // 2. join all urls => hashWindow
  // const tabHashes = await Promise.all(window.tabs.map(hashTab))
  // return generateHash(JSON.stringify(tabHashes.sort())) // 排序保证顺序无关
  const urls = window.tabs.map((tab) => tab.url).sort()
  // console.log("hashwindow - urls", urls)
  const hash = await generateHash(urls.join("|"))
  // console.log("hashwindow finished", hash)
  window.hash = hash
  return hash
}

// 生成Collection的哈希（基于标题和所有Window哈希）
async function hashCollection(collection: Collection) {
  // console.log("hash collection start")
  const windowHashes = await Promise.all(collection.windows.map(hashWindow))
  const hash = await generateHash(
    JSON.stringify(windowHashes.sort()), // 排序保证窗口顺序无关
  )
  collection.hash = hash
  return hash
}

export { hashCollection, hashWindow }
