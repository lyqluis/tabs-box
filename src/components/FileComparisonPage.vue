<script lang="ts" setup>
import { ref, shallowRef } from "vue"
import Layout from "./Layout.vue"
import FileOperator from "./FileOperator.vue"
import file0 from "../../mock/data0.json"
import file1 from "../../mock/data1.json"
import file2 from "../../mock/data2.json"
import file3 from "../../mock/data3.json"
import {
  compareCollectionsByTitleImproved,
  formatData,
  moveCollectionToList,
  wrapCollection,
  getAllCheckedItems,
  moveTabsToWindow,
  moveWindowsToCollection,
  generateExportCollections,
} from "../utils/data"
import { generateFileWithClientInfo } from "../utils/file"
import { useTransferStore } from "../store/transfer"
import type {
  WrappedCollection,
  WrappedWindow,
  WrappedTab,
} from "../types/data"
import { checkTree } from "../utils/tree"

// data
const collectionsA = ref([])
const collectionsB = ref([])
const sameCollections = ref([])
const conflictCollectionsA = shallowRef<WrappedCollection[]>([])
const conflictCollectionsB = shallowRef<WrappedCollection[]>([])

const transferStore = useTransferStore()

/* -------------- file upload --------------- */
const leftFile = ref<File | null>(null)
const rightFile = ref<File | null>(null)
const leftContent = ref<string>("")
const rightContent = ref<string>("")

const handleFileUploaded = (side: "left" | "right", file: File) => {
  console.log(`File uploaded on ${side}:`, file)
  const fileRef = side === "left" ? leftFile : rightFile
  fileRef.value = file

  const reader = new FileReader()
  reader.readAsText(file)

  reader.onload = (e) => {
    let contentRef, collectionsRef, conflictCollectionsRef
    try {
      if (side === "left") {
        contentRef = leftContent
        collectionsRef = collectionsA
        conflictCollectionsRef = conflictCollectionsA
      } else {
        contentRef = rightContent
        collectionsRef = collectionsB
        conflictCollectionsRef = conflictCollectionsB
      }
      const content = e.target?.result as string
      contentRef.value = content
      const jsonData = JSON.parse(content) // 解析JSON内容
      collectionsRef.value = formatData(jsonData)
      console.log("file JSON data:", jsonData)
    } catch (error) {
      console.error("Failed to parse JSON:", error)
    }
  }
}
/* -------------- file upload end --------------- */

const compareFiles = async () => {
  const { sames, conflictsA, conflictsB } =
    await compareCollectionsByTitleImproved(
      collectionsA.value,
      collectionsB.value,
    )
  sameCollections.value = sames.map(wrapCollection)
  conflictCollectionsA.value = conflictsA.map(wrapCollection)
  conflictCollectionsB.value = conflictsB.map(wrapCollection)
  // console.log("compare", diffResult)
}

const exportData = (
  wrappedCollections: WrappedCollection[],
  fileName: string,
) => {
  const file = generateFileWithClientInfo()
  const sameExportCollections = generateExportCollections(sameCollections.value)
  const conflictExportCollections =
    generateExportCollections(wrappedCollections)
  // TODO: maybe sort colelctions
  file.collections = [...sameExportCollections, ...conflictExportCollections]
  console.log("export data: ", file)

  const dataStr = JSON.stringify(file, null, 2)
  const blob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${fileName || "tabs-box-merged-data.json"}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const moveCollection = (targetSide: "left" | "right") => {
  const targetCollections =
    targetSide === "left" ? conflictCollectionsA : conflictCollectionsB
  transferStore.transferList.map((col) => {
    // 1. add new item to target list
    // 2. add `transferred` flag to item
    moveCollectionToList(col, targetCollections)
    col.transferred = true
    checkTree(col, false)
  })
  transferStore.clearTransferList()
}
// BUG: after transferred, source selected list must be cleared
const moveToTarget = (target, operatorId: "left" | "right") => {
  const selectedList = transferStore.transferList
  if (target.tabs) {
    // target is window, move all checked tabs
    // 1. get all checked tabs
    const allCheckedItems: WrappedTab[] = []
    selectedList.map((item) => {
      allCheckedItems.push(...getAllCheckedItems("tab", item))
    })
    // 2. clone tabs, add cloned tabs to target
    const clonedTabs = moveTabsToWindow(allCheckedItems, target)
    clonedTabs.map((t) => checkTree(t, t?.checked))
    // 3. add `transferred` to origin tabs
    allCheckedItems.map((t) => {
      t.transferred = true
      checkTree(t, false)
    })
  } else if (target.windows) {
    // target is collection, move checked tabs' window
    // 1. get all checked window
    const allCheckedWindows: WrappedWindow[] = []
    selectedList.map((item) => {
      allCheckedWindows.push(...getAllCheckedItems("window", item))
    })
    // 2. clone window, add cloned windows to target collection
    const clonedWindows = moveWindowsToCollection(allCheckedWindows, target)
    // 3. handle cloned windows `checked`
    clonedWindows.map((w) => checkTree(w, !!w?.checked))
    // 4. handle origin windows `transferred` and `checked`
    allCheckedWindows.map((w) => {
      w.transferred = true
      checkTree(w, false)
    })
  }
  transferStore.clearTransferList()
}
</script>

<template>
  <Layout>
    <template #actions>
      <div class="flex items-center gap-5">
        <h1 class="text-lg font-bold">Tabs-Box 文件比较工具</h1>
        <button
          class="btn"
          @click="compareFiles"
          :disabled="!leftContent || !rightContent"
        >
          比较文件
        </button>
      </div>
    </template>

    <template #content-container>
      <FileOperator
        :fileName="leftFile?.name"
        operator-id="left"
        :collections="conflictCollectionsA"
        @move-collection="moveCollection"
        @move-to-target="moveToTarget"
        @export-collections="exportData"
        @file-uploaded="handleFileUploaded"
      />
      <FileOperator
        :fileName="rightFile?.name"
        operator-id="right"
        :collections="conflictCollectionsB"
        @move-collection="moveCollection"
        @move-to-target="moveToTarget"
        @export-collections="exportData"
        @file-uploaded="handleFileUploaded"
      />
    </template>
  </Layout>
</template>

<style scoped>
/* use tailwind in style tag */
/* @reference '../style.css'; */
/**/
/* .test { */
/*   @apply bg-red-500; */
/* } */

.file-upload-section {
  display: flex;
  gap: 20px;
  align-items: stretch; /* 让两个upload-pane等高 */
}

.upload-pane {
  flex: 1;
  margin: 0;
  min-width: 0; /* 防止flex项目溢出 */
  height: auto;
}

.left-pane {
  border-color: #4caf50;
}

.right-pane {
  border-color: #2196f3;
}

.file-content {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}

.added {
  color: green;
  font-weight: bold;
}

.removed {
  color: red;
  font-weight: bold;
}

.modified {
  color: orange;
  font-weight: bold;
}
</style>
