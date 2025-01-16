import { formatJSON, generateExportBlob } from "./data"

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

  console.log("File deleted:", fileId)
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
  omImport: (importCollections) => void,
  localContent?,
  localModifiedTime?
) => {
  let res = "Remote file is updated"
  try {
    // query remote file info
    const remoteFileInfo = await queryRemoteFile(token, folderId, fileName)

    if (remoteFileInfo) {
      // read remote json's last modified time
      console.log(`remote file [${fileName}] exists, info: `, remoteFileInfo)
      const f = await readRemoteFile(token, remoteFileInfo.id)
      const remoteFile = formatJSON(f)
      console.log("remote file content:", remoteFile)
      if (remoteFile.modified < localModifiedTime) {
        // 本地文件较新，删除云端文件并上传新文件
        console.log("Local file is newer, updating remote file...")
        await deleteRemoteFile(token, remoteFileInfo.id)
        await uploadFileToFolder(token, folderId, fileName, localContent)
      } else if (remoteFile.modified > localModifiedTime) {
        // 云端文件较新，删除本地文件
        console.log("Remote file is newer, import remote file...")
        await omImport(remoteFile)
        return
      }
      // 云端文件和当前一样或者该文件不存在 modified 属性
    } else {
      // 云端文件不存在，直接上传
      console.log("Remote file does not exist, uploading to Drive...")
      await uploadFileToFolder(token, folderId, fileName, localContent)
    }

    return res
  } catch (error) {
    console.error("Error during sync:", error)
  }
}
