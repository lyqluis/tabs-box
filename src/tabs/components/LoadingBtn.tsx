import { useState } from "react"

const LoadingBtn = ({ onClick, loadingTime = 2000, children }) => {
  const [loading, setLoading] = useState(false)
  const handleClick = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, loadingTime)
    onClick && onClick()
  }

  return (
    <button className="btn btn-outline btn-primary p-2" onClick={handleClick}>
      {loading ? <span className="loading loading-spinner"></span> : children}
    </button>
  )
}

export default LoadingBtn
