import { useEffect, useState } from "react"

const useSeletedList = (currentId) => {
  const [selectedList, setSelectedList] = useState([])

  useEffect(() => {
    setSelectedList([])
  }, [currentId])

  return { selectedList, setSelectedList }
}

export default useSeletedList
