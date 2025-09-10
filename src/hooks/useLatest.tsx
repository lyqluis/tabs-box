import { useEffect, useRef } from "react"

const useLatest = (data) => {
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  return dataRef.current
}

export default useLatest
