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

  // TODO: throttle
  useEffect(() => {
    if (!element) return

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = element
      console.log(
        "usescroll, scrolltop",
        scrollTop,
        "clientHeight",
        clientHeight,
        "scrollHeight",
        scrollHeight
      )

      if (scrollTop > 0) {
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

  return { scrollRef, isOverflowBottom, isOverflowTop }
}

export default useScroll
