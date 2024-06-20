import { useState } from "react"

const LoadingBtn = ({
  onClick,
  loadingTime = 2000,
  children,
  className = "btn btn-outline btn-primary p-2",
  disabled = false // ?
}) => {
  const [loading, setLoading] = useState(false)
  const [innerDisabled, setInnerDisabled] = useState(false)
  const handleClick = () => {
    setLoading(true)
    setInnerDisabled(true)
    setTimeout(() => {
      setInnerDisabled(false)
      setLoading(false)
    }, loadingTime)
    onClick && onClick()
  }

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={innerDisabled}
    >
      {loading ? <span className="loading loading-spinner"></span> : children}
    </button>
  )
}

export default LoadingBtn
