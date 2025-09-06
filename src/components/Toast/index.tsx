import { useEffect, useImperativeHandle, useRef, useState } from "react"
import { createPortal } from "react-dom"

import ToastMessage from "./ToastMessage"

export type ToastItem = {
  id: string | number
  title?: string
  message: string
  type?: "info" | "success" | "error" | "warn"
  duration?: number
  cancelText?: string
  confirmText?: string
}

export const toast = { current: null }

const ToastContainer = () => {
  const toastRef = useRef(null)
  const [toastList, setToastList] = useState<ToastItem[]>([])

  useImperativeHandle(toastRef, () => ({
    show: (options: ToastItem) => {
      const id = Date.now()
      const toastItem: ToastItem = {
        id,
        type: "info",
        ...options
      }
      setToastList((list) => [...list, toastItem])
      return id
    },
    close: (id?) => {
      setToastList((list) => list.filter((item) => item.id !== id))
    }
  }))

  useEffect(() => {
    toast.current = toastRef.current
  }, [])

  const renderDom = (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col justify-center">
      {toastList.map((item) => {
        return <ToastMessage key={item.id} {...item}></ToastMessage>
      })}
    </div>
  )

  return typeof document !== "undefined"
    ? createPortal(renderDom, document.body)
    : renderDom
}

export default ToastContainer
