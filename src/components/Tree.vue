<script lang="ts" setup>
	import { type PropType } from "vue"
	import { useSelectorStore } from "../store/selector"
	import Checkbox from "./Checkbox.vue"

	// Define the props for the Tree component
	const props = defineProps({
		collections: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
	})

	// selector
	const selectorStore = useSelectorStore()
</script>

<template>
	<ul class="menu bg-base-200 rounded-box w-full">
		<li
			v-for="col in collections"
			:key="col.id || col.name"
		>
			<details
				open
				:class="col.deleted && 'text-gray-400'"
			>
				<summary>
					<Checkbox :item="col" />
					{{ col.title ?? "undefined" }} ({{ col.id }})
				</summary>
				<ul>
					<li
						v-for="w in col.windows ?? col.folders"
						:key="w.id || w.name"
					>
						<details
							open
							:class="w.deleted && 'text-gray-400'"
						>
							<summary>
								<Checkbox :item="w" />
								{{ w.name ?? "window" }} ({{ w.id }})
							</summary>
							<ul>
								<li
									v-for="tab in w.tabs ?? w.links"
									:key="tab.id ?? tab.url ?? tab.link"
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
</template>
