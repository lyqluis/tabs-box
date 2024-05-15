chrome.action.onClicked.addListener(() => {
  console.log("open tabs-box page")
  chrome.tabs.create({
    url: "./tabs/tabs-box.html"
  })
})

// export {}
console.log("HELLO WORLD FROM BGSCRIPTS")
