import { useEffect, useState, type FC } from "react"

import { toast, type ToastItem } from "."

const svgs = {
  info: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 stroke-info"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
  ),
  success: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 shrink-0 stroke-success"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 shrink-0 stroke-error"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warn: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-warn h-6 w-6 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

type ToastMessageProps = ToastItem & {
  children?: React.ReactNode
}

const ToastMessage: FC<ToastMessageProps> = ({
  id,
  title,
  message = "You have 1 unread message",
  type = "info",
  duration = 3000,
  children = null,
  cancelText = null,
  confirmText = null
}) => {
  const [isShow, setIsShow] = useState(false)
  const transitionDuration = 300

  const svg = svgs[type]
  duration = type === "error" || type === "warn" ? 5000 : duration

  useEffect(() => {
    setIsShow(true)
    setTimeout(() => {
      setIsShow(false)
      setTimeout(() => {
        toast.current?.close(id)
      }, transitionDuration)
    }, duration)
  }, [])

  return (
    <div
      role="alert"
      className={`alert m-1.5 max-w-80 overflow-hidden shadow-lg transition-all ${duration - transitionDuration} ease-linear ${isShow ? "translate-x-0" : "translate-x-full opacity-0"}`}
    >
      {svg}
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="text-wrap break-all text-xs">{message}</div>
      </div>
      <div>
        {cancelText && <button className="btn btn-sm">{cancelText}</button>}
        {confirmText && (
          <button className="btn btn-primary btn-sm">{confirmText}</button>
        )}
      </div>
    </div>
  )
}

export default ToastMessage
