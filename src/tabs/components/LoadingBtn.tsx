import { useEffect, useState, type ReactNode } from "react"

type LoadingBtnProps = {
  onClick: () => void
  loadingTime?: number // 与 loadingFlag 二选一
  loadingFlag?: boolean
  children: ReactNode
  className?: string
  disabled?: boolean // ?
  Icon?: any
  iconClassName?: string
  text?: string
  textClassName?: string
}
const defaultBtnClassName = "btn btn-outline btn-primary p-2"
const LoadingBtn: React.FC<LoadingBtnProps> = ({
  children,
  text,
  textClassName,
  Icon,
  iconClassName,
  onClick,
  loadingTime,
  loadingFlag,
  className = "btn",
  disabled = false // ?
}) => {
  const [loading, setLoading] = useState(false)
  const [innerDisabled, setInnerDisabled] = useState(false)
  const content = children ? (
    children
  ) : (
    <>
      {Icon && <Icon className={iconClassName} />}
      {text && <span className={textClassName + " lg:inline"}>{text}</span>}
    </>
  )

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
      {loading ? <span className="loading loading-spinner"></span> : content}
    </button>
  )
}

export default LoadingBtn
