import { computed, ref } from "vue"
import type { Collection, WrappedCollection } from "../types/data"

export const useSelector = () => {
  // 1. 状态
  const selectedList = ref<WrappedCollection[]>([])

  // 2. 计算
  const count = computed(() => selectedList.value.length)
  // action
  const isSelected = (item: WrappedCollection) => {
    return selectedList.value.includes(item)
  }

  // 3. 动作
  function addToSelectedList(item: WrappedCollection) {
    if (!isSelected(item)) selectedList.value.push(item)
  }
  function removeFromSelectedList(item: WrappedCollection) {
    const i = selectedList.value.findIndex(
      (selectedItem) => selectedItem === item,
    )
    if (i > -1) selectedList.value.splice(i, 1)
  }
  function clearSelectedList() {
    selectedList.value = []
  }

  // 4. 导出
  return {
    selectedList,
    count,
    isSelected,
    addToSelectedList,
    removeFromSelectedList,
    clearSelectedList,
  }
}
