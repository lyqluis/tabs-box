// tab.window, window.collection
// TODO: 增加循环引用

// 移除循环引用
export const removeCircularReferences = (
  obj: any,
  seen: WeakSet<any> = new WeakSet()
): any => {
  // return directly
  if (obj === null || typeof obj !== "object") return obj

  // obj is visited, return a circular reference
  if (seen.has(obj)) return "[Circular]"

  // record current obj
  seen.add(obj)

  // handle array
  if (Array.isArray(obj)) {
    return obj.map((item) => removeCircularReferences(item, seen))
  }

  // handle plain objects
  const result: Record<string, any> = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = removeCircularReferences(obj[key], seen)
    }
  }

  return result
}

export const generateExportBlob = (data, ext = "json") => {
  const now = Date.now()
  const fileName = `tab-box-config-${now}.${ext}`
  // use Blob since data:text/plain is limited to 2kb
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
  return { fileName, blob }
}
