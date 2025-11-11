# Tree 联动功能实现方案

## 需求分析

实现两个tree组件的联动功能：
1. **展开/折叠联动**：当点击左边tree的某个collection展开时，右边tree中对应的collection也同时展开
2. **滚动联动**：当滚动左边tree到某个collection时，右边tree也同步滚动到相同位置

## 实现思路

### 1. 事件驱动的联动机制
使用自定义事件实现跨组件通信，通过window对象作为事件总线：
- `treeToggle` 事件：用于展开/折叠联动
- `treeScroll` 事件：用于滚动联动

### 2. 节点唯一标识
为每个tree节点生成唯一ID，用于在不同tree之间找到对应的节点：
- Collection: `collection-${collectionId}`
- Window: `window-${collectionId}-${windowId}`
- Tab: `tab-${collectionId}-${windowId}-${tabId}`

### 3. 状态管理
使用ref来管理展开状态和滚动状态，确保联动状态的准确性。

## 具体代码修改

### 1. 修改 Tree.vue 组件

#### 1.1 Script 部分完整替换

```typescript
<script lang="ts" setup>
import { type PropType, ref, watch, nextTick, onMounted, onUnmounted } from "vue"
import { useSelectorStore } from "../store/selector"
import Checkbox from "./Checkbox.vue"

// Define the props for the Tree component
const props = defineProps({
  collections: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  treeId: {
    type: String,
    default: "left",
  },
  partnerTreeId: {
    type: String,
    default: "right",
  },
})

// selector
const selectorStore = useSelectorStore()

// 联动状态管理
const expandedNodes = ref(new Set<string>())
const isScrolling = ref(false)
const scrollTimer = ref<number | null>(null)

// 生成节点唯一ID
const generateNodeId = (col: any, window?: any, tab?: any) => {
  if (tab) {
    return `tab-${col.id}-${window?.id}-${tab.id || tab.url}`
  }
  if (window) {
    return `window-${col.id}-${window.id}`
  }
  return `collection-${col.id}`
}

// 展开/折叠处理
const handleToggle = (event: Event, nodeId: string) => {
  const detailsElement = event.target as HTMLDetailsElement
  const isOpen = detailsElement.open

  if (isOpen) {
    expandedNodes.value.add(nodeId)
  } else {
    expandedNodes.value.delete(nodeId)
  }

  // 通知另一个tree展开/折叠对应节点
  notifyPartnerToggle(nodeId, isOpen)
}

// 通知伙伴tree展开/折叠
const notifyPartnerToggle = (nodeId: string, isOpen: boolean) => {
  const event = new CustomEvent('treeToggle', {
    detail: {
      nodeId,
      isOpen,
      sourceTreeId: props.treeId,
      targetTreeId: props.partnerTreeId
    }
  })
  window.dispatchEvent(event)
}

// 监听来自伙伴tree的展开/折叠事件
const handlePartnerToggle = (event: CustomEvent) => {
  const { nodeId, isOpen, sourceTreeId, targetTreeId } = event.detail
  if (targetTreeId === props.treeId && sourceTreeId !== props.treeId) {
    const detailsElement = document.querySelector(`#${props.treeId} [data-node-id="${nodeId}"]`) as HTMLDetailsElement
    if (detailsElement && detailsElement.open !== isOpen) {
      detailsElement.open = isOpen
      if (isOpen) {
        expandedNodes.value.add(nodeId)
      } else {
        expandedNodes.value.delete(nodeId)
      }
    }
  }
}

// 滚动处理（防抖）
const handleScroll = () => {
  if (isScrolling.value) return // 防止循环滚动

  const treeContainer = document.querySelector(`#${props.treeId} .tree-container`) as HTMLElement
  if (!treeContainer) return

  const scrollTop = treeContainer.scrollTop

  // 防抖处理
  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }

  scrollTimer.value = window.setTimeout(() => {
    // 获取当前可见的节点
    const visibleNodes = getVisibleNodes(treeContainer)

    // 通知伙伴tree滚动到相同位置
    notifyPartnerScroll(scrollTop, visibleNodes)
  }, 50)
}

// 获取可见节点
const getVisibleNodes = (container: HTMLElement) => {
  const nodes: string[] = []
  const rect = container.getBoundingClientRect()
  const elements = container.querySelectorAll('[data-node-id]')

  elements.forEach((el) => {
    const element = el as HTMLElement
    const elementRect = element.getBoundingClientRect()
    // 检查元素是否在可视区域内
    if (elementRect.bottom >= rect.top && elementRect.top <= rect.bottom) {
      nodes.push(element.getAttribute('data-node-id') || '')
    }
  })

  return nodes
}

// 通知伙伴tree滚动
const notifyPartnerScroll = (scrollTop: number, visibleNodes: string[]) => {
  const event = new CustomEvent('treeScroll', {
    detail: {
      scrollTop,
      visibleNodes,
      sourceTreeId: props.treeId,
      targetTreeId: props.partnerTreeId
    }
  })
  window.dispatchEvent(event)
}

// 监听来自伙伴tree的滚动事件
const handlePartnerScroll = (event: CustomEvent) => {
  const { scrollTop, visibleNodes, sourceTreeId, targetTreeId } = event.detail
  if (targetTreeId === props.treeId && sourceTreeId !== props.treeId) {
    const treeContainer = document.querySelector(`#${props.treeId} .tree-container`) as HTMLElement
    if (treeContainer && Math.abs(treeContainer.scrollTop - scrollTop) > 5) {
      isScrolling.value = true
      treeContainer.scrollTop = scrollTop

      // 重置滚动状态
      setTimeout(() => {
        isScrolling.value = false
      }, 100)
    }
  }
}

onMounted(() => {
  // 监听展开/折叠事件
  window.addEventListener('treeToggle', handlePartnerToggle as EventListener)
  // 监听滚动事件
  window.addEventListener('treeScroll', handlePartnerScroll as EventListener)

  // 为tree容器添加滚动监听
  nextTick(() => {
    const treeContainer = document.querySelector(`#${props.treeId} .tree-container`) as HTMLElement
    if (treeContainer) {
      treeContainer.addEventListener('scroll', handleScroll, { passive: true })
    }
  })
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('treeToggle', handlePartnerToggle as EventListener)
  window.removeEventListener('treeScroll', handlePartnerScroll as EventListener)

  if (scrollTimer.value) {
    clearTimeout(scrollTimer.value)
  }
})
</script>
```

#### 1.2 Template 部分修改

```vue
<template>
  <div :id="treeId" class="tree-wrapper h-full">
    <div class="tree-container h-full overflow-y-auto">
      <ul class="menu bg-base-200 rounded-box w-full">
        <li v-for="col in collections" :key="col.id || col.name">
          <details
            :class="col.deleted && 'text-gray-400'"
            :data-node-id="generateNodeId(col)"
            @toggle="handleToggle($event, generateNodeId(col))"
          >
            <summary>
              <Checkbox :item="col" />
              {{ col.title ?? "undefined" }} ({{ col.id }})
            </summary>
            <ul>
              <li v-for="w in col.windows ?? col.folders" :key="w.id || w.name">
                <details
                  :class="w.deleted && 'text-gray-400'"
                  :data-node-id="generateNodeId(col, w)"
                  @toggle="handleToggle($event, generateNodeId(col, w))"
                >
                  <summary>
                    <Checkbox :item="w" />
                    {{ w.name ?? "window" }} ({{ w.id }})
                  </summary>
                  <ul>
                    <li
                      v-for="tab in w.tabs ?? w.links"
                      :key="tab.id ?? tab.url ?? tab.link"
                      :data-node-id="generateNodeId(col, w, tab)"
                    >
                      <!-- TODO: line clamp 2, 会渲染第三行的上沿-->
                      <a
                        :class="
                          'whitespace-normal break-words line-clamp-2' +
                          (tab.deleted && ' text-gray-400')
                        "
                        style="word-break: break-word"
                        :title="tab.url ?? tab.link"
                      >
                        <Checkbox :item="tab" />
                        {{ tab.title ?? tab.link }}
                      </a>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </div>
</template>
```

### 2. 修改 FileOperator.vue 组件

```vue
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
  treeId: {
    type: String,
    default: "left",
  },
  partnerTreeId: {
    type: String,
    default: "right",
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
      <Tree
        :collections="collections"
        :tree-id="treeId"
        :partner-tree-id="partnerTreeId"
      />
    </div>
  </div>
</template>
```

### 3. 修改 FileComparisonPage.vue 组件

```vue
<script lang="ts" setup>
import { reactive, ref } from "vue"
import Layout from "./Layout.vue"
import FileOperator from "./FileOperator.vue"
import DragDropFileUpload from "./DragDropFileUpload.vue"
import file1 from "../../mock/data1.json"
import file2 from "../../mock/data2.json"
import file3 from "../../mock/data3.json"
import { compareCollectionsByTitleImproved, formatData } from "../utils/data"

// data
const collectionsA = ref(formatData(file1))
const collectionsB = ref(formatData(file3))

const leftFile = ref<File | null>(null)
const rightFile = ref<File | null>(null)
const leftContent = ref<string>("")
const rightContent = ref<string>("")
const diffResult = reactive({})

const handleFileUpload = (side: "left" | "right", file: File) => {
  if (side === "left") {
    leftFile.value = file
  } else {
    rightFile.value = file
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (side === "left") {
      leftContent.value = e.target?.result as string
    } else {
      rightContent.value = e.target?.result as string
    }
  }
  reader.readAsText(file)
}

const compareFiles = async () => {
  const result = await compareCollectionsByTitleImproved(
    collectionsA.value,
    collectionsB.value,
  )
  Object.assign(diffResult, result)
  console.log("compare", diffResult)
}
</script>

<template>
  <Layout>
    <!-- // TODO: move upload to content-container -->
    <template #upload-container>
      <!-- TODO: merge upload ui to content container -->
      <!-- <div class="file-upload-section"> -->
      <!--   <div class="upload-pane"> -->
      <!--     <DragDropFileUpload -->
      <!--       side="left" -->
      <!--       :on-file-upload="handleFileUpload" -->
      <!--       accept=".txt,.js,.jsx,.ts,.tsx,.html,.css" -->
      <!--     /> -->
      <!--   </div> -->
      <!---->
      <!--   <div class="upload-pane"> -->
      <!--     <DragDropFileUpload -->
      <!--       side="right" -->
      <!--       :on-file-upload="handleFileUpload" -->
      <!--       accept=".txt,.js,.jsx,.ts,.tsx,.html,.css" -->
      <!--     /> -->
      <!--   </div> -->
      <!-- </div> -->
    </template>

    <template #actions>
      <button class="btn" @click="compareFiles">
        <!-- :disabled="!leftContent || !rightContent" -->
        比较文件
      </button>
      <button class="btn">export file1</button>
      <button class="btn">export file2</button>
    </template>

    <template #content-container>
      <FileOperator
        fileName="file1"
        :collections="diffResult?.conflictCollectionsA"
        tree-id="left-tree"
        partner-tree-id="right-tree"
      />
      <FileOperator
        :collections="diffResult?.conflictCollectionsB"
        tree-id="right-tree"
        partner-tree-id="left-tree"
      />
    </template>
  </Layout>
</template>

<style scoped>
@reference '../style.css';

.test {
  @apply bg-red-500;
}

.file-upload-section {
  display: flex;
  gap: 20px;
  align-items: stretch; /* 让两个upload-pane等高 */
}

.upload-pane {
  flex: 1;
  margin: 0;
  min-width: 0; /* 防止flex项目溢出 */
  height: auto;
}

.left-pane {
  border-color: #4caf50;
}

.right-pane {
  border-color: #2196f3;
}

.file-content {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}

.added {
  color: green;
  font-weight: bold;
}

.removed {
  color: red;
  font-weight: bold;
}

.modified {
  color: orange;
  font-weight: bold;
}
</style>
```

## 实现特点

### 1. 防止循环联动
- 通过 `sourceTreeId` 和 `targetTreeId` 确保事件不会循环触发
- 滚动时使用 `isScrolling` 状态防止互相滚动

### 2. 性能优化
- 滚动事件使用防抖处理，避免频繁触发
- 使用 passive 事件监听器提升滚动性能

### 3. 精确匹配
- 基于collection ID、window ID和tab ID生成唯一标识符
- 确保两边tree的节点能够准确对应

### 4. 容错处理
- 添加了空值检查和边界条件处理
- 确保在某些数据不完整时仍能正常工作

## 使用说明

1. **安装依赖**：确保项目已有必要的依赖
2. **替换代码**：按照上述代码修改对应文件
3. **测试功能**：
   - 点击左边tree的collection展开，右边对应collection也会展开
   - 滚动左边tree，右边tree会同步滚动
   - 折叠操作也会同步联动

## 扩展性

这个实现方案具有良好的扩展性：
- 可以轻松添加更多的联动事件
- 支持未来添加第三个tree
- 联动逻辑可以配置化，比如可以选择性启用某些联动功能