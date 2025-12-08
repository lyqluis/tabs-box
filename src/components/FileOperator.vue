<script lang="ts" setup>
import { computed, ref } from "vue"
import Tree from "./Tree.vue"
import { useTransferStore } from "../store/transfer"
import { getAllCheckedItems, generateExportCollections } from "../utils/data"
import { useSelector } from "../hooks/useSelector"
import type { WrappedCollection } from "../types/data.d.ts"
import { checkTree } from "../utils/tree"
import { watch } from "vue"

const props = defineProps({
  fileName: {
    type: String,
    default: "",
  },
  collections: {
    type: Array,
    default: () => [],
  },
  operatorId: {
    type: [String, Number],
    required: true,
  },
})

const {
  selectedList,
  addToSelectedList,
  removeFromSelectedList,
  clearSelectedList,
} = useSelector()

// transfer
const transferStore = useTransferStore()
const isSelectMode = computed<boolean>(() => {
  return (
    transferStore.isTransferMode &&
    transferStore.activeFileOperatorId === props.operatorId
  )
})

// 定义emit
const emit = defineEmits([
  "move-to-target",
  "move-collection",
  "export-collections",
])

// select模式相关状态
const selectedItem = ref(null)

const handleChecked = (checked: boolean, collection: WrappedCollection) => {
  if (checked) {
    addToSelectedList(collection)
    transferStore.setAcitveFileOperatorId(props.operatorId)
  } else {
    removeFromSelectedList(collection)
    transferStore.setAcitveFileOperatorId(props.operatorId)
  }
}

const remove = () => {
  const checkedWindows = []
  const checkedTabs = []
  console.log("remove", selectedList)
  selectedList.value.map((item: WrappedCollection) => {
    // find all checked sub windows and tabs, tag their `deleted` to true
    // TODO: deleted ui in the tree
    const collection = item
    checkedWindows.push(...getAllCheckedItems("window", collection, false))
    checkedTabs.push(...getAllCheckedItems("tab", collection))
  })
  checkedWindows.map((w) => {
    w.deleted = true
  })
  checkedTabs.map((t) => {
    t.deleted = true
  })
  selectedList.value.map((col) => checkTree(col, false))
  clearSelectedList()
}

// DEV: 开启select模式
const enableSelectMode = () => {
  transferStore.enableTransferMode(props.operatorId)
  selectedItem.value = null
}

// 关闭select模式
const disableSelectMode = () => {
  transferStore.disableTransferMode()
  selectedItem.value = null
  // 返回到另一个file的 checked + move enabled 状态
  const activeSelectedOperatorId =
    props.operatorId === "left" ? "right" : "left"
  transferStore.setAcitveFileOperatorId(activeSelectedOperatorId)
}

const handleTransfer = (isMovingToRoot?: boolean) => {
  // move whole collection to the root
  if (isMovingToRoot) {
    emit("move-collection", props.operatorId)

    disableSelectMode()
    transferStore.disableTransferMode()
    selectedItem.value = null
    return
  }
  // move specific tab/window to target selected item
  if (selectedItem.value) {
    // TODO:
    // refactor item data
    // transfer selected item to target window/collection

    // console.log("选中的目标对象:", selectedItem.value)
    emit("move-to-target", selectedItem.value, props.operatorId)

    disableSelectMode()
    transferStore.disableTransferMode()
    selectedItem.value = null
  }
}

const move = () => {
  if (selectedList.value.length) {
    // enable tranfer mode
    const activeSelectedOperatorId =
      props.operatorId === "left" ? "right" : "left"
    transferStore.enableTransferMode(activeSelectedOperatorId)
    transferStore.setTransferList(selectedList.value)
    selectedItem.value = null
  }
}

const exportData = () => {
  emit("export-collections", props.collections, props.fileName)
}

watch(
  () => transferStore.transferList,
  (list, preList) => {
    console.log("watch transfer list")
    if (!list.length) selectedList.value = []
  },
)
</script>

<template>
  <div
    class="file-operator flex-1 m-0 p-2 rounded border-2 h-full flex flex-col min-h-0"
  >
    <!-- TODO: if no collections, upload -->
    <div class="flex justify-between items-center m-2 flex-shrink-0">
      <div>{{ fileName || "default filename" }}</div>
      <div class="btns flex gap-1">
        <div
          class="btn btn-sm"
          :class="isSelectMode ? 'btn-error' : 'btn-info'"
          @click="isSelectMode ? disableSelectMode() : enableSelectMode()"
        >
          {{ isSelectMode ? "取消选择" : "选择模式" }}
        </div>
        <button
          class="btn btn-sm"
          @click="remove"
          :disabled="!selectedList.length"
        >
          x
        </button>
        <button
          class="btn btn-sm"
          @click="move"
          :disabled="
            isSelectMode ||
            !(
              selectedList.length &&
              transferStore.activeFileOperatorId === operatorId
            )
          "
        >
          {{ operatorId === "left" ? "→" : "←" }}
        </button>
        <button
          v-if="isSelectMode"
          class="btn btn-sm btn-success"
          @click="handleTransfer(true)"
        >
          移动到根目录
        </button>
        <button
          v-if="isSelectMode"
          class="btn btn-sm btn-success"
          @click="handleTransfer()"
          :disabled="!selectedItem"
        >
          确定
        </button>
        <button class="btn btn-sm" @click="exportData">↑</button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto min-h-0">
      <Tree
        :collections="collections"
        :is-select-mode="isSelectMode"
        :operator-id="operatorId"
        :active-item-id="selectedItem?.data?.id"
        @item-selected="selectedItem = $event"
        @item-checked="handleChecked"
      ></Tree>
    </div>
  </div>
</template>
