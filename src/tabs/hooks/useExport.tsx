import { useCallback, useEffect, useState } from "react"
import Check from "react:~assets/svg/check.svg"

import { useGlobalCtx } from "~tabs/components/context"
import { exportFile, generateData } from "~tabs/components/data"
import { useDialog } from "~tabs/components/Dialog/DialogContext"

const EXPORT_TIME = 1500

const useCounter = (len = -1, duration = 10000) => {
  const [count, setCount] = useState(0)
  const [start, setStart] = useState(false)

  useEffect(() => {
    if (start) {
      let animationFrameId
      const startTime = performance.now() // 获取动画开始时间

      const animate = (time) => {
        console.log("aniamte")

        const elapsedTime = time - startTime // Calculate elapsed time
        const progress = Math.min(elapsedTime / duration, 1) // Normalize progress
        const current = Math.round(progress * len) // Ensure count is an integer

        setCount((pre) => {
          console.log("set count", count)
          return current
        }) // Update count

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate) // Continue animation if progress is less than 1
        }
      }

      animationFrameId = requestAnimationFrame(animate) // Continue animation if progress is less than 1

      // Start the animation when the component mounts or when target/duration changes
      return () => {
        cancelAnimationFrame(animationFrameId) // Cleanup the animation frame on unmount
      }
    }
  }, [len, duration, start])

  const startCounter = () => setStart(true)
  const resetCounter = () => {
    setStart(false)
    setCount(0)
  }
  return { count, startCounter, resetCounter }
}

const useExport = () => {
  const [isExporting, setIsExporting] = useState(false)
  // reducer state
  const {
    state: { collections }
  } = useGlobalCtx()
  const { openDialog, setDialog } = useDialog()
  const [collectionLength, setCollectionLength] = useState(collections.length)
  const { count, startCounter, resetCounter } = useCounter(
    collectionLength,
    EXPORT_TIME
  )

  console.log("useexport count", count) // NOTE: count changes

  const LengthContent = ({ count, finished = false }) => (
    <div className="flex w-full items-center">
      {finished ? (
        <>
          <Check className="mr-2 h-10 w-10" />
          Ready {count} collections
        </>
      ) : (
        <>
          <span className="loading loading-spinner loading-lg mr-2"></span>
          Found {count} collections
        </>
      )}
    </div>
  )

  useEffect(() => {
    let content
    if (count < collections.length) {
      content = <LengthContent count={count} />
    } else if (count === collections.length) {
      content = <LengthContent count={count} finished />
    }
    setDialog({ content })
  }, [count])

  const exportData = useCallback(async () => {
    setIsExporting(true)
    setCollectionLength(collections.length)

    const data = generateData(collections)
    console.log("export json data", data)

    // 1. import file
    openDialog({
      title: "Export",
      content: <LengthContent count={count} />,
      cancelText: "Cancel",
      onCancel: () => resetCounter(),
      confirmText: "Select destination",
      onConfirm: () => {
        // TODO: export
        exportFile(data)
        resetCounter()
      }
    })

    startCounter()
  }, [count, collections])

  return { isExporting, exportData }
}

export default useExport
