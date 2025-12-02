import { computed, ref } from "vue"
import type { Collection, WrappedCollection } from "../types/data"

export type SelectedItem = {
  value: WrappedCollection
  source: "left" | "right" // from which file operator
  windowIndex?: number
}

export const useSelector = () => {
  // 1. 状态
  const selectedList = ref<WrappedCollection[]>([])
  const isTransferMode = ref(false) // 是否开启select模式
  const activeFileOperatorId = ref<string | number | null>(null) // 当前激活的FileOperator ID

  // 2. 计算
  const count = computed(() => selectedList.value.length)
  // action
  const isSelected = (item: SelectedItem) => {
    const window = item.value?.window
    const collection = window?.collection ?? item.value.collection
    return selectedList.value.includes(item)
    //   ||
    // selectedList.value.includes(window) ||
    // selectedList.value.includes(collection)
  }
  const getSelectedListByOperator = (id: "left" | "right") => {
    return selectedList.value.filter((item) => item.source === id)
  }

  // 3. 动作
  function add(item: SelectedItem) {
    if (!isSelected(item)) selectedList.value.push(item)
  }
  function remove(item: SelectedItem) {
    // BUG: if a tab checked, then its window/collection checked,
    // then uncheck window/collection, tab will be still in the list, cuase its not unchecked particularly
    // debugger
    const i = selectedList.value.findIndex(
      (selectedItem) => selectedItem.value === item.value,
    )
    if (i > -1) selectedList.value.splice(i, 1)
  }
  function toggle(checked, item) {
    console.log("toggle", checked)
    checked ? add(item) : remove(item)
  }
  function clear() {
    selectedList.value = []
  }
  function setAcitveFileOperatorId(id: string | number) {
    activeFileOperatorId.value = id
  }
  function enableTranferMode(id: string | number) {
    isTransferMode.value = true
    activeFileOperatorId.value = id
  }
  function disableTransferMode() {
    isTransferMode.value = false
    activeFileOperatorId.value = null
  }

  // 4. 导出
  return {
    selectedList,
    count,
    isSelected,
    getSelectedListByOperator,
    add,
    remove,
    toggle,
    clear,
    isTransferMode,
    activeFileOperatorId,
    setAcitveFileOperatorId,
    enableTranferMode,
    disableTransferMode,
  }
}
