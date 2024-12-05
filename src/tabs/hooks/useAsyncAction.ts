import { useState } from "react"

const useAsyncAction = (asyncFunction) => {
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    setIsExecuting(true)
    setError(null)
    try {
      await asyncFunction(...args)
    } catch (error) {
      setError(error)
    } finally {
      setIsExecuting(false)
    }
  }

  return { isExecuting, error, execute }
}

export default useAsyncAction
