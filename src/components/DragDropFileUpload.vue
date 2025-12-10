<script lang="ts" setup>
import { computed } from "vue"
import { ref, watch } from "vue"

// Define props
const props = defineProps({
  // allow parent component to control directly
  forceActive: {
    type: Boolean,
    default: false,
  },
  hasExistingData: {
    type: Boolean,
    default: false,
  },
  side: {
    type: String as () => "left" | "right",
    required: true,
  },
  onFileUpload: {
    type: Function,
    required: true,
  },
  accept: {
    type: String,
    default: ".txt,.js,.jsx,.ts,.tsx,.html,.css,.json",
  },
})

// Reactive state
const isDragOver = ref(false)
const fileName = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const isEffecttiveDragOver = computed(
  () => props.forceActive || isDragOver.value,
)

watch(
  () => props.forceActive,
  (val) => {
    isDragOver.value = val
  },
)

// Handle drag events
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelection(files[0])
  }
}

// Handle file selection from input or drag/drop
const handleFileSelection = (file: File) => {
  fileName.value = file.name
  props.onFileUpload(props.side, file)
}

// Handle traditional file input change
const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFileSelection(file)
  }
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

defineExpose({ handleFileSelection })
</script>

<template>
  <div class="file-upload-container">
    <!-- <h2 class="font-bold mb-1"> -->
    <!--   {{ side === "left" ? "左侧文件" : "右侧文件" }} -->
    <!-- </h2> -->

    <!-- Drag and drop area -->
    <div
      class="drag-drop-area"
      :class="{
        // 'flex-col': true,
        'drag-over': isEffecttiveDragOver,
      }"
      v-on="
        forceActive === undefined
          ? {
              dragenter: handleDragEnter,
              dragleave: handleDragLeave,
              dragover: handleDragOver,
              drop: handleDrop,
            }
          : {}
      "
      @click="triggerFileInput"
    >
      <div
        v-if="!(hasExistingData && forceActive === false)"
        class="flex flex-col items-center justify-center p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-10 w-10 mb-2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16 a4 4 0 0 1 -.88 -7.903 A 5 5 0 1 1 15.9 6 L 16 6 a 5 5 0 0 1 1 9.9 M15 13 l-3 -3 m0 0 l-3 3 m3 -3 v12"
          />
        </svg>
        <p class="text-gray-600 mb-1">拖拽文件到此处</p>
        <p class="text-gray-400 text-sm mb-2">或点击选择文件</p>
        <div class="btn btn-sm">选择文件</div>
      </div>
    </div>

    <!-- Traditional file input (hidden) -->
    <input
      ref="fileInput"
      class="hidden"
      type="file"
      :accept="accept"
      @change="handleFileInputChange"
    />

    <!-- File name display -->
    <p
      v-if="fileName && forceActive === undefined"
      class="mt-2 text-sm text-gray-600"
    >
      已选择: {{ fileName }}
    </p>
  </div>
</template>

<style scoped>
.file-upload-container {
  width: 100%;
  min-height: 60px;
  height: 100%;
}

.drag-drop-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-height: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
}

.drag-drop-area:hover {
  border-color: #9ca3af;
  background-color: #f3f4f6;
}

.drag-drop-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.is-transparent {
  opacity: 0.5;
  pointer-events: none;
}
</style>
