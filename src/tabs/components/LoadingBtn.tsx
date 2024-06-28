import { useEffect, useState, type ReactNode } from "react"

type LoadingBtnProps = {
  onClick: () => void
  loadingTime?: number // 与 loadingFlag 二选一
  loadingFlag?: boolean
  children: ReactNode
  className?: string
  disabled?: boolean // ?
}

const LoadingBtn: React.FC<LoadingBtnProps> = ({
  onClick,
  loadingTime,
  loadingFlag,
  children,
  className = "btn btn-outline btn-primary p-2",
  disabled = false // ?
}) => {
  const [loading, setLoading] = useState(false)
  const [innerDisabled, setInnerDisabled] = useState(false)
  const handleClick = () => {
    if (loadingTime !== undefined || loadingFlag !== undefined) {
      setLoading(true)
      setInnerDisabled(true)

      loadingTime &&
        setTimeout(() => {
          setInnerDisabled(false)
          setLoading(false)
        }, loadingTime)
    }
    onClick && onClick()
  }

  useEffect(() => {
    if (!loadingFlag) {
      setLoading(loadingFlag)
      setInnerDisabled(loadingFlag)
    }
  }, [loadingFlag])

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
