import { createRoot } from "react-dom/client"

import { BaseModal } from "@/components/Modal"

const useModal = () => {
  type ModalFunc = {
    open: (config: any) => {
      destroy: () => void
      update: (newConfig: any) => void
    }
  }

  const modal: ModalFunc = {
    open: (config: any) => {
      // create container
      const container = document.createElement("div")
      container.className = "modal-root"
      document.body.appendChild(container)

      // create react root
      const root = createRoot(container)
      let currentConfig = { ...config, isOpen: true } // 强制 isOpen 为 true

      const render = () => {
        const handleConfirm = async () => {
          await currentConfig.onConfirm?.()
          destroy()
        }

        const handleCancel = async () => {
          await currentConfig.onCancel?.()
          destroy()
        }

        root.render(
          <BaseModal
            {...currentConfig}
            isOpen={true}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )
      }

      const destroy = () => {
        root.unmount()
        document.body.removeChild(container)
      }

      const update = (newConfig: any) => {
        currentConfig = { ...currentConfig, ...newConfig, isOpen: true } // 合并配置并保持开启
        render() // 重新渲染组件
      }

      render() // 初始渲染

      return { destroy, update } // 返回包含 update 的对象
    }
  }

  return { modal }
}

export default useModal
