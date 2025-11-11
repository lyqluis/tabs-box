<script lang="ts" setup>
import { reactive, ref } from "vue"
import Layout from "./Layout.vue"
import FileOperator from "./FileOperator.vue"
import DragDropFileUpload from "./DragDropFileUpload.vue"
import file1 from "../../mock/data1.json"
import file2 from "../../mock/data2.json"
import file3 from "../../mock/data3.json"
import { compareCollectionsByTitleImproved, formatData } from "../utils/data"

// data
const collectionsA = ref(formatData(file1))
const collectionsB = ref(formatData(file3))

const leftFile = ref<File | null>(null)
const rightFile = ref<File | null>(null)
const leftContent = ref<string>("")
const rightContent = ref<string>("")
const diffResult = reactive({})

const handleFileUpload = (side: "left" | "right", file: File) => {
  if (side === "left") {
    leftFile.value = file
  } else {
    rightFile.value = file
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (side === "left") {
      leftContent.value = e.target?.result as string
    } else {
      rightContent.value = e.target?.result as string
    }
  }
  reader.readAsText(file)
}

const compareFiles = async () => {
  const result = await compareCollectionsByTitleImproved(
    collectionsA.value,
    collectionsB.value,
  )
  Object.assign(diffResult, result)
  console.log("compare", diffResult)
}
</script>

<template>
  <Layout>
    <!-- // TODO: move upload to content-container -->
    <template #upload-container>
      <!-- TODO: merge upload ui to content container -->
      <!-- <div class="file-upload-section"> -->
      <!--   <div class="upload-pane"> -->
      <!--     <DragDropFileUpload -->
      <!--       side="left" -->
      <!--       :on-file-upload="handleFileUpload" -->
      <!--       accept=".txt,.js,.jsx,.ts,.tsx,.html,.css" -->
      <!--     /> -->
      <!--   </div> -->
      <!---->
      <!--   <div class="upload-pane"> -->
      <!--     <DragDropFileUpload -->
      <!--       side="right" -->
      <!--       :on-file-upload="handleFileUpload" -->
      <!--       accept=".txt,.js,.jsx,.ts,.tsx,.html,.css" -->
      <!--     /> -->
      <!--   </div> -->
      <!-- </div> -->
    </template>

    <template #actions>
      <button class="btn" @click="compareFiles">
        <!-- :disabled="!leftContent || !rightContent" -->
        比较文件
      </button>
      <button class="btn">export file1</button>
      <button class="btn">export file2</button>
    </template>

    <template #content-container>
      <FileOperator
        fileName="file1"
        :collections="diffResult?.conflictCollectionsA"
      />
      <FileOperator :collections="diffResult?.conflictCollectionsB" />
    </template>
  </Layout>
</template>

<style scoped>
@reference '../style.css';

.test {
  @apply bg-red-500;
}

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
