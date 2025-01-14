import { useState } from "react"
import { flushSync } from "react-dom"

const useAsyncAction = (asyncFunction) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    // force a synchronous update, avoid batch updates caused by too many async updates queued
    flushSync(() => {
      setIsExecuting(true)
    })
    setError(null)
    try {
      await asyncFunction(...args)
    } catch (error) {
      setError(error)
    } finally {
      // force a synchronous update, avoid batch updates caused by too many async updates queued
      flushSync(() => {
        setIsExecuting(false)
      })
    }
  }

  return { isExecuting, error, execute }
}

export default useAsyncAction
