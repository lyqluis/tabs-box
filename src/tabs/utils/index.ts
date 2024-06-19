import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useEffect, useRef } from "react"
import { v4 as uuid } from "uuid"

import { localSaveCollection } from "~tabs/store"

export const generateId = () => {
  return uuid()
}

export const useRenderCount = () => {
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current++
    console.log(`Component re-rendered: ${renderCount.current}`)
  }, [])
}

dayjs.extend(relativeTime)
export const fromNow = (time) => dayjs(time).fromNow()

export const shortURL = (url: string) => {
  if (!url) return ""
  const REG = /\/\/([a-zA-Z0-9.-]+)\//
  return url.match(REG)[1]
}

class Platform {
  constructor() {
    // todo check the platform
    this.platform = "chrome"
  }

  listenBrowser = () => {
    if (this.platform === "chrome") {
      return chrome.tabs.onCreated.addListener((tab) => {
        console.log("新标签页创建：", tab)
      })
    }
  }

  cancelListenBrowser = () => {}
}

export const platformInstance = new Platform()
