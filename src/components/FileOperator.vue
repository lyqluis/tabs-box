<script lang="ts" setup>
import Tree from "./Tree.vue"
import { useSelectorStore } from "../store/selector"

const props = defineProps({
  fileName: {
    type: String,
    default: "",
  },
  collections: {
    type: Array,
    default: () => [],
  },
})

// selector
const selectorStore = useSelectorStore()
const remove = () => {
  selectorStore.selectedList.map((item) => {
    item.deleted = true
    return item
  })
  selectorStore.clear()
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
      <div class="btns">
        <div class="btn btn-sm">+</div>
        <div class="btn btn-sm" @click="remove">x</div>
        <div class="btn btn-sm">=></div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto min-h-0">
      <Tree :collections="collections"></Tree>
    </div>
  </div>
</template>
