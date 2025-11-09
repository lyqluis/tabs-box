<script lang="ts" setup>
	import Tree from "./Tree.vue"
	import file from "../mock/data1.json"
	import { reactive } from "vue"
	import { formatData } from "../utils/data"
	import { useSelectorStore } from "../store/selector"
	// data
	// const collections = reactive(formatData(file))
	const props = defineProps({
		collections: {
			type: Array,
			default: () => []
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
</script>

<template>
	<div class="file-operator">
		<div class="flex justify-end w-full m-2">
			<div class="btn">+</div>
			<div
				class="btn"
				@click="remove"
			>
				x
			</div>
			<div class="btn">=></div>
		</div>
		<Tree :collections="collections"></Tree>
	</div>
</template>
