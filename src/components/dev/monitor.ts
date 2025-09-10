const button = document.getElementById("triggerButton")
const contentElement = document.getElementById("contentElement")

button.addEventListener("click", () => {
  const startTime = performance.now()

  // 监听内容元素的变化
  const observer = new MutationObserver(() => {
    const endTime = performance.now()
    console.log(`DOM 更新响应时间: ${(endTime - startTime).toFixed(2)}ms`)
    observer.disconnect() // 停止监听
  })

  observer.observe(contentElement, {
    childList: true, // 监听子节点变化
    characterData: true, // 监听文本内容变化
  })

  // 触发内容更新（模拟异步操作）
  setTimeout(() => {
    contentElement.textContent = "新内容"
  }, 100)
})
