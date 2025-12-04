<script lang="ts" setup>
// Define the props for the Tree component
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: null,
  }, // collection | window | tab
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["item-checked"])

const findRootCheckedParent = (item) => {
  if (item.window) {
    return findRootCheckedParent(item.window)
  }
  if (item.collection) {
    return findRootCheckedParent(item.collection)
  }
  if (item.checked) return item
}

const handleCheck = (e) => {
  emit("item-checked", e.target.checked, props.item)
}
</script>
<template>
  <input
    type="checkbox"
    className="checkbox checkbox-sm"
    :checked="item.checked"
    :indeterminate="item.indeterminate"
    :disabled="disabled"
    @change="handleCheck"
  />
</template>
