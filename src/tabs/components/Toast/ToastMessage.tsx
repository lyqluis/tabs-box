import { useEffect, useState } from "react"

import { toast } from "."

const ToastMessage = ({
  id,
  message = "You have 1 unread message",
  duration = 3000,
  children = null,
  cancelText = null,
  confirmText = null
}) => {
  const [isShow, setIsShow] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsShow(false)
      toast.current?.close(id)
    }, duration)
  }, [])

  return (
    <div
      role="alert"
      className={`alert m-1.5 shadow-lg transition-all duration-1000 ease-linear ${isShow ? "translate-x-0" : "translate-x-full"}`}
      // style={{ transform: isShow ? "translateX(0)" : "translateX(100%)" }}
    >
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
      <div>
        <h3 className="font-bold">New message!{id}</h3>
        <div className="text-xs">{message}</div>
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
