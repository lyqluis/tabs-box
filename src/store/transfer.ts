import { defineStore } from "pinia"
import { ref } from "vue"

export const useTransferStore = defineStore("selector", () => {
  // 1. 状态
  const transferList = ref([])
  const isTransferMode = ref(false) // 是否开启select模式
  const activeFileOperatorId = ref<string | number | null>(null) // 当前激活的FileOperator ID

  // 2. 计算

  // 3. 动作
  function setAcitveFileOperatorId(id: string | number) {
    activeFileOperatorId.value = id
  }
  function enableTransferMode(id: string | number) {
    isTransferMode.value = true
    activeFileOperatorId.value = id
  }
  function disableTransferMode() {
    isTransferMode.value = false
    activeFileOperatorId.value = null
  }
  function setTransferList(value) {
    console.log("set transferList", value)
    transferList.value = value
  }
  function clearTransferList() {
    transferList.value = []
  }

  // 4. 导出
  return {
    isTransferMode,
    activeFileOperatorId,
    setAcitveFileOperatorId,
    enableTransferMode,
    disableTransferMode,
    transferList,
    setTransferList,
    clearTransferList,
  }
})

// DEV: 仅开发模式生效，繁殖热重载暴露数据
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    useTransferStore().$reset()
  })
}
