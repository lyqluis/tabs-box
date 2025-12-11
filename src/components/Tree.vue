<script lang="ts" setup>
import { onMounted, watch, type PropType } from "vue"
import { findRootCollection, checkParent, checkTree } from "../utils/tree.ts"
import { nextTick } from "vue"
import type { WrappedCollection } from "../types/data"
import { useTransferStore } from "../store/transfer"

// Define the props for the Tree component
const props = defineProps({
  collections: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  // 用来选择目标list item
  isSelectMode: {
    type: Boolean,
    default: false,
  },
  operatorId: {
    type: String as PropType<"left" | "right">,
    required: true,
  },
  // only for collection/window in select mode
  activeItemId: {
    type: String,
    default: null,
  },
})

// 定义emit
const emit = defineEmits(["item-selected", "item-checked"])

// selector
const transferStore = useTransferStore()

// TODO: computed n window | n tabs

const handleItemCheck = (event, item) => {
  const checked = event.target.checked
  const collection = checkTree(item, checked)
  emit("item-checked", checked, collection)
  // console.log("[Tree]: item checked", checked, item)
}

const handleItemClick = (event: MouseEvent, item: WrappedCollection) => {
  if (props.isSelectMode) {
    emit("item-selected", item)
  }
}

const handleConflictExpand = (e: Event) => {
  const el = e.currentTarget as HTMLDetailsElement
  // 防止事件重复处理
  if ((el as any)._handlingConflictExpand) return
  ;(el as any)._handlingConflictExpand = true

  const isOpen = el.open // toggle事件触发时，open状态已经更新
  const conflictId = el.dataset.conflictId

  // 只有存在冲突ID时才需要同步另一个面板
  if (conflictId) {
    const conflictOperatorId = props.operatorId === "left" ? "right" : "left"
    const conflictColEl = document.querySelector(
      `[data-col-id="${conflictOperatorId}-${conflictId}"]`,
    ) as HTMLDetailsElement
    if (conflictColEl) conflictColEl.open = isOpen
  }

  // 清理标记，允许下一次处理
  ;(el as any)._handlingConflictExpand = false
}

const bindToggleEvents = async () => {
  // 使用更具体的选择器，确保选中当前组件内的所有details元素
  const details = document.querySelectorAll(
    `[data-col-id^="${props.operatorId}-"]`,
  )
  // 为当前操作面板的元素添加监听器
  ;[...details].map((el) => {
    el.removeEventListener("toggle", handleConflictExpand)
    el.addEventListener("toggle", handleConflictExpand)
  })
}

onMounted(async () => {
  await nextTick()
  setTimeout(bindToggleEvents)
})
watch(
  () => props.collections,
  async (val, preVal) => {
    await nextTick() // 确保Dom更新
    bindToggleEvents()
  },
  { flush: "post" }, // 确保在DOM更新后执行
)
</script>

<template>
  <ul class="menu bg-base-200 rounded-box w-full">
    <li v-for="col in collections" :key="col.data.id || col.data.name">
      <details
        :class="(col.deleted || col.transferred) && 'text-gray-400'"
        :data-col-id="operatorId + '-' + col.data.id"
        :data-conflict-id="col.conflict"
      >
        <summary
          @click="handleItemClick($event, col)"
          :class="activeItemId === col.data.id && 'menu-active'"
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            :checked="col.checked"
            :indeterminate="col.indeterminate"
            @change="handleItemCheck($event, col)"
            @click.stop=""
            :disabled="transferStore.isTransferMode || col.transferred"
          />
          {{ col.data.title ?? "undefined" }}
          {{ col.transferred ? "(transferred)" : "" }}
          <span class="text-sm text-gray-400">({{ col.data.id }})</span>
          <span>{{ col.conflict && "⚠️" }}</span>
        </summary>
        <ul>
          <li v-for="w in col.windows" :key="w.data.id || w.data.name">
            <details
              :class="(w.deleted || w.transferred) && 'text-gray-400'"
              open
            >
              <summary
                @click="handleItemClick($event, w)"
                :class="activeItemId === w.data.id && 'menu-active'"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  :checked="w.checked"
                  :indeterminate="w.indeterminate"
                  @change="handleItemCheck($event, w)"
                  :disabled="
                    transferStore.isTransferMode ||
                    col.transferred ||
                    w.transferred ||
                    w.deleted
                  "
                />
                {{ w.data.title ?? "window" }}
                ({{ w.data.id }})
                {{ w.transferred ? "(transferred)" : "" }}
                {{ w.deleted ? "(deleted)" : "" }}
              </summary>
              <ul>
                <li
                  v-for="tab in w.tabs ?? w.links"
                  :key="tab.data.id ?? tab.data.url ?? tab.data.link"
                >
                  <!-- TODO: line clamp 2, 会渲染第三行的上沿-->
                  <a
                    :class="
                      'whitespace-normal break-words line-clamp-2' +
                      ((tab.deleted ||
                        tab.transferred ||
                        col.transferred ||
                        w.transferred) &&
                        ' text-gray-400')
                    "
                    style="word-break: break-word"
                    :title="tab.data.url ?? tab.data.link"
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      :checked="tab.checked"
                      :indeterminate="tab.indeterminate"
                      @change="handleItemCheck($event, tab)"
                      :disabled="
                        transferStore.isTransferMode ||
                        col.transferred ||
                        tab.transferred ||
                        w.transferred ||
                        tab.deleted
                      "
                    />
                    {{ tab.data.title ?? tab.data.link }}
                  </a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</template>
