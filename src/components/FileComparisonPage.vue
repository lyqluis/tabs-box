<script lang="ts" setup>
	import { reactive, ref } from "vue"
	import FileOperator from "./FileOperator.vue"
	import file1 from "../mock/data1.json"
	import file2 from "../mock/data2.json"
	import { compareCollectionsByTitleImproved, formatData } from "../utils/data"

	// data
	const collectionsA = ref(formatData(file1))
	const collectionsB = ref(formatData(file2))

	// Simple diff algorithm implementation
	const diffLines = (left: string, right: string) => {
		const leftLines = left.split("\n")
		const rightLines = right.split("\n")

		const maxLines = Math.max(leftLines.length, rightLines.length)
		const result: Array<any> = []

		for (let i = 0; i < maxLines; i++) {
			const leftLine = leftLines[i] || ""
			const rightLine = rightLines[i] || ""

			if (leftLine !== rightLine) {
				result.push({
					line: i + 1,
					left: leftLine,
					right: rightLine,
					type:
						leftLine === ""
							? "added"
							: rightLine === ""
							? "removed"
							: "modified",
				})
			}
		}

		return result
	}

	const leftFile = ref<File | null>(null)
	const rightFile = ref<File | null>(null)
	const leftContent = ref<string>("")
	const rightContent = ref<string>("")
	const diffResult = reactive({})

	const handleFileUpload = (side: "left" | "right", event: Event) => {
		const target = event.target as HTMLInputElement
		const file = target.files?.[0]
		if (!file) return

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
			collectionsB.value
		)
		Object.assign(diffResult, result)
		console.log("compare", diffResult)
	}
</script>

<template>
	<div class="file-comparison-page">
		<h1>文件比较工具</h1>

		<div class="file-upload-section">
			<div class="upload-pane">
				<h2>左侧文件</h2>
				<input
					type="file"
					@change="handleFileUpload('left', $event)"
					accept=".txt,.js,.jsx,.ts,.tsx,.html,.css"
				/>
				<p v-if="leftFile">已选择: {{ leftFile.name }}</p>
			</div>

			<div class="upload-pane">
				<h2>右侧文件</h2>
				<input
					type="file"
					@change="handleFileUpload('right', $event)"
					accept=".txt,.js,.jsx,.ts,.tsx,.html,.css"
				/>
				<p v-if="rightFile">已选择: {{ rightFile.name }}</p>
			</div>
		</div>

		<button
			class="btn"
			@click="compareFiles"
		>
			<!-- :disabled="!leftContent || !rightContent" -->
			比较文件
		</button>

		<div class="comparison-container">
			<div class="pane left-pane">
				<h2>左侧文件内容</h2>
				<FileOperator :collections="diffResult?.conflictCollectionsA" />
				<!-- <pre class="file-content">
          {{ leftContent }}
        </pre> -->
			</div>

			<div class="pane right-pane">
				<h2>右侧文件内容</h2>
				<FileOperator :collections="diffResult?.conflictCollectionsB" />
				<!-- <pre class="file-content">{{ rightContent }}</pre> -->
			</div>
		</div>

		<!-- <div
			v-if="diffResult.length > 0"
			class="diff-results"
		>
			<h2>发现的差异</h2>
			<ul>
				<li
					v-for="(diff, index) in diffResult"
					:key="index"
				>
					<strong>第 {{ diff.line }} 行:</strong>
					<span
						v-if="diff.type === 'added'"
						class="added"
					>
						新增</span
					>
					<span
						v-if="diff.type === 'removed'"
						class="removed"
					>
						删除</span
					>
					<span
						v-if="diff.type === 'modified'"
						class="modified"
					>
						修改</span
					>
					<br />
					左侧: {{ diff.left }}
					<br />
					右侧: {{ diff.right }}
				</li>
			</ul>
		</div> -->
	</div>
</template>

<style scoped>
	.file-comparison-page {
		padding: 20px;
		font-family: Arial, sans-serif;
		max-width: 1200px;
		margin: 0 auto;
	}

	.file-upload-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 20px;
	}

	@media (min-width: 768px) {
		.file-upload-section {
			flex-direction: row;
		}
	}

	.upload-pane {
		flex: 1;
		margin: 0;
	}

	.upload-pane h2 {
		margin-bottom: 10px;
	}

	.upload-pane input[type="file"] {
		margin-bottom: 10px;
	}

	.comparison-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
		margin-bottom: 20px;
	}

	@media (min-width: 768px) {
		.comparison-container {
			flex-direction: row;
		}
	}

	.pane {
		flex: 1;
		border: 1px solid #ccc;
		padding: 10px;
		border-radius: 4px;
		min-width: 0; /* 防止flex项目溢出 */
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

	.diff-results {
		border-top: 1px solid #ccc;
		padding-top: 20px;
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

	button {
		padding: 10px 20px;
		margin-bottom: 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		width: 100%;
	}

	@media (min-width: 768px) {
		button {
			width: auto;
		}
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}
</style>
