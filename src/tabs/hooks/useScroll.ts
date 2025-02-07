import { useCallback, useEffect, useState } from "react"

const useScroll = () => {
  const [element, setElement] = useState(null)

  const [isOverflowTop, setIsOverflowTop] = useState(false)
  const [isOverflowBottom, setIsOverflowBottom] = useState(false)

  // 回调 Ref：在元素挂载或卸载时更新状态
  const scrollRef = useCallback((node) => {
    if (node !== null) {
      setElement(node)
    } else {
      setElement(null)
    }
  }, [])

  const scrollTo = (top = 0) => {
    if (element) {
      element.scrollTop = top
    }
  }

  const scrollToTop = () => scrollTo(0)

  // TODO: throttle
  useEffect(() => {
    if (!element) return

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = element

      if (scrollTop > 5) {
        setIsOverflowTop(true)
      } else {
        setIsOverflowTop(false)
      }

      if (scrollTop + clientHeight < scrollHeight) {
        setIsOverflowBottom(true)
      } else {
        setIsOverflowBottom(false)
      }
    }

    element.addEventListener("scroll", handleScroll)

    // clear event listener
    return () => {
      element.removeEventListener("scroll", handleScroll)
    }
  }, [element])

  return { scrollRef, isOverflowBottom, isOverflowTop, scrollToTop, scrollTo }
}

export default useScroll
