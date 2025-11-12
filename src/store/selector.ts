import { defineStore } from "pinia"
import { computed, ref } from "vue"

type SelectedItem = {
  data: {}
  source: string | number // from which file operator
}

export const useSelectorStore = defineStore("selector", () => {
  // 1. 状态
  const selectedList = ref([])

  // 2. 计算
  const count = computed(() => selectedList.value.length)
  const isSelected = (item) => {
    const window = item?.window
    const collection = window?.collection ?? item.collection
    return (
      selectedList.value.includes(item) ||
      selectedList.value.includes(window) ||
      selectedList.value.includes(collection)
    )
  }

  // 3. 动作
  function add(item) {
    if (!isSelected(item)) selectedList.value.push(item)
  }
  function remove(item) {
    const i = selectedList.value.indexOf(item)
    if (i > -1) selectedList.value.splice(i, 1)
  }
  function toggle(checked, item) {
    console.log("toggle", checked)
    checked ? add(item) : remove(item)
  }
  function clear() {
    selectedList.value = []
  }

  // 4. 导出
  return {
    selectedList,
    count,
    isSelected,
    add,
    remove,
    toggle,
    clear,
  }
})
