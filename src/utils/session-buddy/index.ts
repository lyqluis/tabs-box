import { readFile } from "fs/promises"
import { writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { compareCollectionsByTitleImproved } from "./data.ts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

type SessionBuddyFileType = {
  format: string // nxs.json.v2
  backupId: string // NyZw73LgaXw5MuIiOHYTH90
  created: string // 2025-10-09T12:44:32.872Z
  source: {
    type: string // client
    id: string // 6Pi4aG69KsSpXqRQuSWWkDu
    version: string // 4.0.5
    lanuage: string // zh-CN
    ua: string // Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
  }
  collections: [any]
}

const getUa = (ua: string) => {
  const uaRegExp = /^[^\(]*\(([^)]*)\)/
  return ua?.match(uaRegExp)?.[1]
}

// NOTE: merge 2 session-buddy file
// 如果来自同一个源，直接id比较合并(没有必要，因为合并必然发生在不同来源的数据)
// 否则比较title合并，全部增量处理
const mergeSessionBuddyFiles = async (pathA: string, pathB: string) => {
  try {
    const contentA = await readFile(join(__dirname, pathA), "utf8")
    const contentB = await readFile(join(__dirname, pathB), "utf8")
    const fileA = JSON.parse(contentA)
    const fileB = JSON.parse(contentB)
    // compare base/source info
    const uaA = getUa(fileA?.source?.ua)
    const uaB = getUa(fileB?.source?.ua)
    console.log("文件内容是：", uaA, uaB)

    let res
    if (fileA.format !== fileB.format) {
      // if format is different, merge with name
      console.log("格式不同，比较name")
      res = await compareCollectionsByTitleImproved(
        fileA.collections,
        fileB.collections,
      )
      console.log("result: ", res)
    } else if (uaA === uaB) {
      // if 2 files from same sources, merge with id
      console.log("来源相同，比较id")
    } else {
      // else merge with name(except defualt name)
      console.log("来源不同，比较name")
      res = await compareCollectionsByTitleImproved(
        fileA.collections,
        fileB.collections,
      )
      // console.log("result: ", res)
    }
    // write a file 'seesion-buddy-merged.<date>.json'
    writeFileSync(
      `session-buddy-merged-${new Date().toLocaleString().replace(/[/: ]/g, "-")}.json`,
      JSON.stringify({ collections: res }, null, 2),
    )
  } catch (err) {
    console.error("读文件失败:", err)
  }
}

mergeSessionBuddyFiles(
  "../../assets/mock/session-buddy-backup-2025-10-09-20-44-12.json",
  "../../assets/mock/session-buddy-backup-2025-10-10-13-42-33.json",
)

// trans seesion-buddy file to tabs-box file
