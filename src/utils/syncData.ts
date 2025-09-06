import { getBaseCollections, setAllBaseCollections } from "@/store/syncBase"

import { generateData, generateExportBlob, normalizeData } from "./data"

export const findOrCreateFolder = async (token, folderName) => {
  // 查询是否已存在该目录
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const listResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  )

  if (!listResponse.ok) {
    throw new Error("Failed to list folders")
  }

  const folderList = await listResponse.json()

  // 如果目录已存在，返回目录 ID
  if (folderList.files.length > 0) {
    console.log("folder exists", folderList.files[0])
    return folderList.files[0].id
  }

  // 如果目录不存在，创建新目录
  const createResponse = await fetch(
    "https://www.googleapis.com/drive/v3/files",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder"
      })
    }
  )

  if (!createResponse.ok) {
    throw new Error("Failed to create folder")
  }

  const folderData = await createResponse.json()
  console.log("create folder success", folderData)

  return folderData.id
}

// TODO: same name file in the cloud folder
// should add delete old file function
export const uploadFileToFolder = async (
  token: string,
  folderId: string,
  fileName: string,
  fileContent?: any
) => {
  // 定义 boundary
  const boundary = "-------314159265358979323846"
  const delimiter = "\r\n--" + boundary + "\r\n"
  const close_delim = "\r\n--" + boundary + "--"

  // 定义元数据
  const metadata = {
    name: fileName,
    parents: [folderId] // 指定父目录
  }

  // stringify file content
  const { blob } = generateExportBlob(fileContent)

  // 构造 multipart 请求体
  const multipartRequestBody = new Blob(
    [
      delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: application/json\r\n\r\n",
      blob,
      close_delim
    ],
    { type: 'multipart/related; boundary="' + boundary + '"' }
  )

  // 发送请求
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: multipartRequestBody
    }
  )

  if (!response.ok) {
    throw new Error("Failed to upload file")
  }

  const fileData = await response.json()
  console.log("File uploaded:", fileData)

  return fileData
}

export const deleteRemoteFile = async (token, fileId) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  )

  if (!response.ok) {
    throw new Error("Failed to delete file")
  }

  console.log("Remote file deleted:", fileId)
}

export const queryRemoteFile = async (token, folderId, fileName) => {
  const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`
  const fields = "fields=files(id,name)" // files(id,name,modifiedTime), if needed
  const listResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&${fields}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  )

  if (!listResponse.ok) {
    throw new Error("Failed to list files")
  }

  const fileList = await listResponse.json()
  console.log("query result: ", fileList)

  return fileList.files[0]
}

const readRemoteFile = async (token, fileId, jsonParse = true) => {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token
      }
    }
  )

  if (!response.ok) {
    throw new Error("Failed to read file")
  }

  // 返回文件内容（字符串格式）
  const fileContent = await response.text()
  return jsonParse ? JSON.parse(fileContent) : fileContent
}

export const syncFile = async (
  token,
  folderId,
  fileName,
  localCollections,
  localModifiedTime?
) => {
  let res = {
    syncResultMessage: "Remote file is updated",
    conflicts: [0, 0],
    merged: []
  }

  try {
    // query remote file info
    const remoteFileInfo = await queryRemoteFile(token, folderId, fileName)
    let uploadFile

    // 如果云端文件存在，和本地进行对比
    if (remoteFileInfo) {
      // 1. read cloud file data
      console.log(`remote file [${fileName}] exists, info: `, remoteFileInfo)
      const f = await readRemoteFile(token, remoteFileInfo.id)
      const remoteFile = normalizeData(f)
      console.log("local file content:", localCollections)
      console.log("remote file content:", remoteFile)

      // ALWAYS DO:
      // 1. compare local data with cloud one to get a merged data
      // 2. upload merged data as new cloud data and local data
      // TEST: cause if local modified time > cloud, but cloud collection is more than local,
      // it should be import from cloud

      // get local base collections
      const localBaseCollections = await getBaseCollections()
      const { conflicts, merged } = compareCollectionsWithCloudAndBase(
        localCollections,
        remoteFile.collections,
        localBaseCollections
      )

      console.log("compare result", conflicts, merged)
      console.table(merged)

      let syncResultMessage = "Merge collections finished"
      if (conflicts[0] > 0 || conflicts[1] > 0) {
        syncResultMessage += `, added ${conflicts[0]}, changed ${conflicts[1]}`
      }

      res = {
        ...res,
        syncResultMessage,
        conflicts,
        merged
      }
      // save merged collections as sync base to local
      setAllBaseCollections(merged)

      // generate export data with merged data
      uploadFile = generateData(merged)

      // delete remote file
      await deleteRemoteFile(token, remoteFileInfo.id)
    } else {
      // 云端文件不存在，直接上传本地collections
      console.log("Remote file does not exist, uploading to Drive...")
      // generate export data with local data
      uploadFile = generateData(localCollections)
    }

    // sync result data to cloud
    await uploadFileToFolder(token, folderId, fileName, uploadFile)

    return res
  } catch (error) {
    console.error("Error during sync:", error)
    throw error
  }
}

const compareCollectionsWithCloud = (
  localCollections: Collection[],
  cloudCollections: Collection[]
) => {
  // const conflicts: ConflictAction[] = []
  const conflicts = []

  // 1. 创建同步前本地和云端的 Map 以便快速查找
  const localMap = new Map<string, Collection>()
  localCollections.map((col) => {
    if (col && col.id) {
      localMap.set(col.id, col)
    } else {
      console.warn("Skipping local collection with missing id:", col)
    }
  })

  const cloudMap = new Map<string, Collection>()
  cloudCollections.map((col) => {
    if (col && col.id) {
      cloudMap.set(col.id, col)
    } else {
      console.warn("Skipping cloud collection with missing id:", col)
    }
  })

  // 2. 创建一个 Map 来构建最终的本地列表
  const resultMap = new Map<string, Collection>()

  // 3. 遍历云端列表，处理云端新增、修改、冲突和无变化
  cloudMap.forEach((cloudCollection, id) => {
    const localCollection = localMap.get(id)

    if (!localCollection) {
      // 场景 1: 云端新增 (Cloud Added)
      resultMap.set(id, cloudCollection)
      // TODO: if local collection is deleted, but cloud older collection existed
    } else {
      // 本地和云端都存在
      if (cloudCollection.updated > localCollection.updated) {
        // 场景 3: 云端修改 (Cloud Modified) - 云端版本更新，采用云端
        resultMap.set(id, cloudCollection)
      } else if (localCollection.updated > cloudCollection.updated) {
        // 场景 4: 本地修改 (Local Modified) - 本地版本更新。
        // 这可能是并发修改，需要标记冲突，但默认保留本地版本。
        conflicts.push({
          type: "CONFLICT",
          collectionId: id,
          localData: localCollection,
          cloudData: cloudCollection
          // conflictType: 'local_newer' // 可以添加类型区分
        })
        // 默认保留本地版本在最终列表中
        resultMap.set(id, localCollection)
      } else {
        // updated 相同
        // TODO:
        // if (!isEqual(localCollection, cloudCollection)) {
        //   // 场景 5: 冲突 (Timestamp Equal) - timestamp 相同但内容不同
        //   conflicts.push({
        //     type: "CONFLICT",
        //     collectionId: id,
        //     localData: localCollection,
        //     cloudData: cloudCollection
        //     // conflictType: 'timestamp_equal' // 可以添加类型区分
        //   })
        //   // 默认保留本地版本在最终列表中
        //   resultMap.set(id, localCollection)
        // } else {
        // 场景 6: 无变化 (No Change) - timestamp 和内容都相同
        resultMap.set(id, localCollection) // 保留本地版本即可
        // }
      }

      // 从 localMap 中移除已处理的项
      localMap.delete(id)
    }
  })

  // 4. 遍历 localMap 中剩余的项，处理只存在于同步前本地的项 (本地新增或云端删除)
  localMap.forEach((localCollection, id) => {
    // 场景 2: 本地删除 (Local Deleted) - 这些项在云端不存在。
    // 如果它们在同步前本地存在，且没有被云端同ID项覆盖，
    // 那么它们应该保留在最终的本地列表中，以便通过“上传所有”策略同步到云端。
    resultMap.set(id, localCollection)
  })

  // 5. 将 resultMap 的值转换为数组
  const mergedLists = Array.from(resultMap.values())

  return { mergedLists, conflicts }
}

// NOTE: 3-ways merge algorithm related
const findLatestCollection = (...collections) => {
  console.log("find latest collection", collections)
  return collections.reduce((latest, col) => {
    if (col && latest.updated < col.updated) {
      latest = col
    }
    return latest
  })
}
const mergeConflictWindow = (local: Window, cloud: Window, base: Window) => {
  return {
    ...local, // NOTE: local first
    tabs: mergeList<Tab>(local.tabs, cloud.tabs, base.tabs)
  }
}
const mergeWindows = (
  locals: Window[],
  clouds: Window[],
  bases: Window[]
): Window[] => {
  const localMap = new Map<string, Window>()
  locals.map((window) => {
    localMap.set(window.id, window)
  })
  const cloudMap = new Map<string, Window>()
  clouds.map((window) => {
    cloudMap.set(window.id, window)
  })
  const baseMap = new Map<string, Window>()
  bases.map((window) => {
    baseMap.set(window.id, window)
  })

  const merged: Window[] = []
  const allIds = new Set([
    ...baseMap.keys(),
    ...localMap.keys(),
    ...cloudMap.keys()
  ])

  allIds.forEach((id) => {
    const base = baseMap.get(id)
    const local = localMap.get(id)
    const cloud = cloudMap.get(id)

    // 本地新增
    if (local && !cloud && !base) {
      merged.push(local)
      return
    }
    // 云端新增
    if (!local && cloud && !base) {
      merged.push(cloud)
      return
    }
    // // 本地删除
    // if (!local && cloud && base) {
    //   return
    // }
    // // 云端删除
    // if (local && !cloud && base) {
    //   return
    // }

    // local, cloud both existed，merge conficts, addition first
    if (local && cloud) {
      const window = mergeConflictWindow(local, cloud, base)
      merged.push(window)
    }
  })
  return merged
}
const mergeConflictCollection = (
  local: Collection,
  cloud: Collection,
  base: Collection
): Collection => {
  const latest = findLatestCollection(local, cloud, base)
  return {
    ...latest,
    // windows: mergeWindows(local.windows, cloud.windows, base.windows)
    windows: mergeList<Window>(
      local?.windows,
      cloud?.windows,
      base?.windows,
      (local, cloud, base) => {
        return {
          ...local,
          tabs: mergeList<Tab>(local?.tabs, cloud?.tabs, base?.tabs)
        }
      }
    )
  }
}

// 3-way merge 三向合并
const compareCollectionsWithCloudAndBase = (
  localCollections: Collection[],
  cloudCollections: Collection[],
  baseCollections: Collection[]
) => {
  const conflicts = [0, 0] // local added, local changed

  // 1. 创建同步前本地/云端的 Map 以便快速查找
  const localMap = new Map<string, Collection>()
  localCollections.map((col) => {
    if (col && col.id) {
      localMap.set(col.id, col)
    } else {
      console.warn("Skipping local collection with missing id:", col)
    }
  })

  const cloudMap = new Map<string, Collection>()
  cloudCollections.map((col) => {
    if (col && col.id) {
      cloudMap.set(col.id, col)
    } else {
      console.warn("Skipping cloud collection with missing id:", col)
    }
  })

  const baseMap = new Map<string, Collection>()
  baseCollections.map((col) => {
    if (col && col.id) {
      baseMap.set(col.id, col)
    } else {
      console.warn("Skipping base collection with missing id:", col)
    }
  })

  console.log(
    "@compareCollectionsWithCloudAndBase,",
    localMap.size,
    cloudMap.size
  )
  const merged: Collection[] = []
  // 处理所有已知ID
  const allIds = new Set([
    ...baseMap.keys(),
    ...localMap.keys(),
    ...cloudMap.keys()
  ])

  allIds.forEach((id) => {
    const baseCol = baseMap.get(id)
    const localCol = localMap.get(id)
    const cloudCol = cloudMap.get(id)

    console.log(
      "compare: ",
      localCol?.updated,
      cloudCol?.updated,
      baseCol?.updated,
      localCol?.updated === baseCol?.updated,
      cloudCol?.updated > localCol?.updated,
      localCol?.updated > cloudCol?.updated
    )

    // 场景1：双方未修改
    const BOTH_UNCHANGED =
      localCol && cloudCol && localCol.updated === cloudCol.updated
    if (BOTH_UNCHANGED) {
      console.log(
        "collection - ",
        localCol.name || localCol.title,
        ", both unchanged"
      )
      merged.push(localCol)
      return
    }
    // 本地新增
    const LOCAL_ADD = localCol && !cloudCol && !baseCol
    if (LOCAL_ADD) {
      console.log(
        "collection - ",
        localCol.name || localCol.title,
        ", local add"
      )
      merged.push(localCol)
      return
    }
    // 云端新增
    const CLOUD_ADD = !localCol && cloudCol && !baseCol
    if (CLOUD_ADD) {
      console.log(
        "collection - ",
        cloudCol.name || cloudCol.title,
        ", cloud add"
      )
      merged.push(cloudCol)
      conflicts[0]++
      return
    }
    // NOTE: no need to deal with local/remote delete, cause no action here
    // // 本地删除
    // if (!localCol && cloudCol && baseCol) {
    //   return
    // }
    // // 云端删除
    // if (localCol && !cloudCol && baseCol) {
    //   return
    // }
    // 本地修改，云端未改
    const LOCAL_UPDATE =
      localCol &&
      cloudCol &&
      localCol.updated > cloudCol.updated &&
      (!baseCol || cloudCol.updated === baseCol.updated)
    if (LOCAL_UPDATE) {
      console.log(
        "collection - ",
        localCol.name || localCol.title,
        ", local changed, cloud unchanged"
      )
      merged.push(localCol)
      return
    }
    // 本地未改，云端修改
    const CLOUD_UPDATE =
      localCol &&
      cloudCol &&
      baseCol &&
      cloudCol.updated > localCol.updated &&
      (!baseCol || cloudCol.updated === baseCol.updated)
    if (CLOUD_UPDATE) {
      console.log(
        "collection - ",
        localCol.name || localCol.title,
        ", local unchanged, cloud changed"
      )
      merged.push(cloudCol)
      conflicts[1]++
      return
    }

    // 本地、云端都被修改，合并冲突，增量优先
    const BOTH_UPDATE_WITH_CONFLICTS = baseCol
      ? localCol?.updated > baseCol?.updated &&
        cloudCol?.updated > baseCol?.updated
      : localCol?.updated !== cloudCol?.updated
    if (BOTH_UPDATE_WITH_CONFLICTS) {
      console.log(
        "collection - ",
        localCol.name || localCol.title,
        ", conflict in local and cloud"
      )
      mergeConflictCollection(localCol, cloudCol, baseCol)
      conflicts[1]++
    }
  })

  return { merged, conflicts }
}

function mergeList<T>(
  localList: T[],
  cloudList: T[],
  baseList: T[],
  resolveConflict?: Function
): T[] {
  const localMap = new Map<string, T>()
  localList?.map((item) => {
    localMap.set(item.id, item)
  })
  const cloudMap = new Map<string, T>()
  cloudList?.map((item) => {
    cloudMap.set(item.id, item)
  })
  const baseMap = new Map<string, T>()
  baseList?.map((item) => {
    baseMap.set(item.id, item)
  })

  const mergedList: T[] = []
  const allIds = new Set([
    ...baseMap.keys(),
    ...localMap.keys(),
    ...cloudMap.keys()
  ])

  allIds.forEach((id) => {
    const base = baseMap.get(id)
    const local = localMap.get(id)
    const cloud = cloudMap.get(id)

    // 本地新增
    if (local && !cloud && !base) {
      mergedList.push(local)
      return
    }
    // 云端新增
    if (!local && cloud && !base) {
      mergedList.push(cloud)
      return
    }
    // // 本地删除
    // if (!local && cloud && base) {
    //   return
    // }
    // // 云端删除
    // if (local && !cloud && base) {
    //   return
    // }

    // local, cloud both existed，merge conficts, addition first
    if (local && cloud) {
      const item = mergeConflictItem<T>(local, cloud, base, resolveConflict)
      mergedList.push(item)
    }
  })

  return mergedList
}

function mergeConflictItem<T>(
  local: T,
  cloud: T,
  base: T,
  resolveConflict?: Function
): T {
  if (resolveConflict) return resolveConflict(local, cloud, base)
  return local
}
