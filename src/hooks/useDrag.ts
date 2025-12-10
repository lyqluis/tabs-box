import { ref } from "vue"

export const useDrag = ({ handleDropFile }) => {
  // 拖拽状态管理
  const isDragActive = ref(false)
  let dragCounter = 0 // 用于解决进入子元素触发dragleave的闪烁问题

  // 处理文件拖入容器
  const onDragEnter = (e: DragEvent) => {
    console.log("on drag enter")
    e.preventDefault()
    dragCounter++
    if (dragCounter === 1) {
      isDragActive.value = true
    }
  }

  // 处理文件离开容器
  const onDragLeave = (e: DragEvent) => {
    console.log("on drag leave")
    e.preventDefault()
    dragCounter--
    if (dragCounter === 0) {
      isDragActive.value = false
    }
  }

  // 处理文件放下
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    dragCounter = 0
    isDragActive.value = false
    // 这里通常不需要处理文件，因为 DragDropFileUpload 组件内部会处理 drop 事件
    // 但我们需要重置状态以移除高亮
    handleDropFile && handleDropFile(e)
  }
  return {
    isDragActive,
    onDragEnter,
    onDragLeave,
    onDrop,
  }
}
