import { useEffect, useRef } from "react"

export const useRenderCount = () => {
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current++
    console.log(`Component re-rendered: ${renderCount.current}`)
  }, [])
}
