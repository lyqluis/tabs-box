<script lang="ts" setup>
import { computed, ref } from "vue"
import Tree from "./Tree.vue"
import { useSelectorStore, type SelectedItem } from "../store/selector"
import { getAllCheckedItems, moveCollectionToList } from "../utils/data"

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

const isSelectMode = computed<boolean>(() => {
  return (
    selectorStore.isTransferMode &&
    selectorStore.activeFileOperatorId === props.operatorId
  )
})

// 定义emit
const emit = defineEmits(["move-to-target", "move-collection"])

// select模式相关状态
const selectedItem = ref(null)

// selector
const selectorStore = useSelectorStore()

const remove = () => {
  const checkedWindows = []
  const checkedTabs = []
  selectorStore.selectedList.map((item: SelectedItem) => {
    // TODO: find all checked sub windows and tabs, tag their `deleted` to true
    const collection = item.value
    checkedWindows.push(...getAllCheckedItems("window", collection))
    checkedTabs.push(...getAllCheckedItems("tab", collection))
  })
  checkedWindows.map((w) => {
    w.deleted = true
  })
  checkedTabs.map((t) => {
    t.deleted = true
  })
  selectorStore.clear()
}

// DEV: 开启select模式
const enableSelectMode = () => {
  selectorStore.enableTranferMode(props.operatorId)
  selectedItem.value = null
}

// 关闭select模式
const disableSelectMode = () => {
  selectorStore.disableTransferMode()
  selectedItem.value = null
  // 返回到另一个file的 checked + move enabled 状态
  const activeSelectedOperatorId =
    props.operatorId === "left" ? "right" : "left"
  selectorStore.setAcitveFileOperatorId(activeSelectedOperatorId)
}

const handleTransfer = (isMovingToRoot?: boolean) => {
  // move whole collection to the root
  if (isMovingToRoot) {
    emit("move-collection", props.operatorId)

    disableSelectMode()
    selectorStore.disableTransferMode()
    selectedItem.value = null
    selectorStore.clear()
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
    selectorStore.disableTransferMode()
    selectedItem.value = null
    selectorStore.clear()
  }
}

const move = () => {
  if (selectorStore.selectedList.length) {
    // enable tranfer mode
    const activeSelectedOperatorId =
      props.operatorId === "left" ? "right" : "left"
    selectorStore.enableTranferMode(activeSelectedOperatorId)
    selectedItem.value = null
  }
}

// TODO:
// 1. 排序collections
// - delete collection/window/tab
// - add collection/window/tab
// -
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
        <div
          class="btn btn-sm"
          @click="remove"
          :disabled="
            isSelectMode ||
            !(
              selectorStore.selectedList.length &&
              selectorStore.activeFileOperatorId === operatorId
            )
          "
        >
          x
        </div>
        <button
          class="btn btn-sm"
          @click="move"
          :disabled="
            isSelectMode ||
            !(
              selectorStore.selectedList.length &&
              selectorStore.activeFileOperatorId === operatorId
            )
          "
        >
          =>
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
      </div>
    </div>
    <div class="flex-1 overflow-y-auto min-h-0">
      <Tree
        :collections="collections"
        :is-select-mode="isSelectMode"
        :operator-id="operatorId"
        :active-item-id="selectedItem?.data?.id"
        @item-selected="selectedItem = $event"
      ></Tree>
    </div>
  </div>
</template>
