import type { Collection } from "../types/data"

type FileFormat = {
  collections: Collection[]
  created: string
  id: string // exportId/backupId
  format?: string // nxs.json.v2
  history?: any[]
  source: {
    id: string
    language: string // zh-CN
    ua: string // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    version: string // 4.0.3
  }
}

type SessionBuddyFmt = {
  format: "nxs.json.v2"
  backupId: "qBbnBnRXJ5csl2UM26uwKpT"
  created: "2025-12-13T07:13:56.093Z"
  source: {
    type: "client"
    id: "6Pi4aG69KsSpXqRQuSWWkDu"
    version: "4.1.0"
    language: "zh-CN"
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
  }
  collections: []
  history: []
}

const getLanguage = () => {
  const languages = navigator.languages
  return languages?.[0] || navigator.language || "en-US"
}
const getUserAgent = () => {
  // 现代方案：User-Agent Client Hints
  // if ("userAgentData" in navigator) {
  //   const uaData = (navigator as any).userAgentData as NavigatorUAData
  //   console.log("navigator", navigator, "uaData", uaData)
  //   const brands = uaData.brands
  //     .map((b: any) => `${b.brand}/${b.version}`)
  //     .join("; ")
  //   return `${brands} (${uaData.platform})`
  // }
  // 传统降级
  return navigator.userAgent
}

export const generateFileWithClientInfo = () => {
  return {
    id: "",
    language: getLanguage(),
    type: "merge",
    ua: getUserAgent(),
    version: "",
  }
}

export const generateExportFileName = (isSessionBuddyFmt?: boolean) => {
  const t = new Date()
  const d = `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(
    2,
    "0",
  )}.${String(t.getDate()).padStart(2, "0")}-${String(t.getHours()).padStart(
    2,
    "0",
  )}.${String(t.getMinutes()).padStart(2, "0")}.${String(
    t.getSeconds(),
  ).padStart(2, "0")}`
  let filename = isSessionBuddyFmt
    ? "session-buddy-merged-"
    : "tabs-box-merged-"
  filename += d + ".json"
  return filename
}
